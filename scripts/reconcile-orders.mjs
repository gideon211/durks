// One-off reconciliation: create missing Order documents for successful
// Paystack transactions that were never received by the webhook (webhook was
// not being delivered between ~July 2026 and the fix).
//
// Run:
//   node --env-file=.env.local scripts/reconcile-orders.mjs             # DRY-RUN (default, writes nothing)
//   node --env-file=.env.local scripts/reconcile-orders.mjs --write     # create the missing orders
//
// Options:
//   --write            actually create orders (default is dry-run)
//   --from=YYYY-MM-DD  start date of transactions to scan (default 2026-07-01)
//   --to=YYYY-MM-DD    end date of transactions to scan (default today)
//   --no-email         do not send confirmation emails for recovered orders
//
// Idempotent: matches on the unique paystackReference; safe to rerun.

import mongoose from "mongoose";
import dns from "node:dns";
import crypto from "node:crypto";
import nodemailer from "nodemailer";

const DNS_SERVERS = process.env.DNS_SERVERS || "8.8.8.8,8.8.4.4";
dns.setServers(DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : def;
};
const WRITE = args.includes("--write");
const SEND_EMAIL = !args.includes("--no-email");
const FROM = getArg("from", "2024-01-01");
const TO = getArg("to", new Date().toISOString().slice(0, 10));

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  mobile_money: "Mobile Money",
  mobilemoney: "Mobile Money",
  bank: "Bank Transfer",
  bank_transfer: "Bank Transfer",
  ussd: "USSD",
  qr: "QR",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
};

function mapChannel(channel) {
  const c = String(channel || "").trim();
  return c ? (PAYMENT_METHOD_LABELS[c] ?? c) : "Card";
}

function isValidId(v) {
  return mongoose.isValidObjectId(v);
}

function toItem(it) {
  return {
    drinkId: isValidId(it?.drinkId) ? new mongoose.Types.ObjectId(it.drinkId) : new mongoose.Types.ObjectId(),
    image: it?.image || "",
    name: String(it?.name || "Item"),
    pack: it?.pack != null ? String(it.pack) : "",
    price: Number(it?.price) || 0,
    quantity: Math.max(1, Number(it?.quantity) || 1),
  };
}

function buildOrder(tx) {
  const meta = tx.metadata || {};
  const mc = meta.customer || {};
  const tc = tx.customer || {};
  const email = String(mc.email || tc.email || "").trim().toLowerCase();
  const fullName = String(
    mc.fullName || [tc.first_name, tc.last_name].filter(Boolean).join(" ") || email.split("@")[0] || "Customer"
  ).trim();
  const paidGhs = (Number(tx.amount) || 0) / 100;

  const hadItems = Array.isArray(meta.items) && meta.items.length > 0;
  const normalizedItems = hadItems
    ? meta.items.map((it) => toItem(it))
    : [{ drinkId: new mongoose.Types.ObjectId(), image: "", name: "Miscellaneous (details unavailable)", pack: "", price: paidGhs, quantity: 1 }];

  const totalAmount = hadItems
    ? normalizedItems.reduce((s, it) => s + it.price * it.quantity, 0)
    : paidGhs;
  const totalItems = normalizedItems.reduce((s, it) => s + it.quantity, 0);

  let deliveryDate = null;
  if (meta.deliveryDate) {
    const d = new Date(meta.deliveryDate);
    if (!isNaN(d.getTime())) deliveryDate = d;
  }

  const paidAt = tx.paid_at ? new Date(tx.paid_at) : new Date(tx.created_at);

  const doc = {
    userId: isValidId(meta.userId) ? new mongoose.Types.ObjectId(meta.userId) : null,
    customer: {
      fullName,
      email,
      phone: String(mc.phone || "N/A").trim() || "N/A",
      address: String(mc.address || "N/A").trim() || "N/A",
      city: String(mc.city || "").trim(),
      country: String(mc.country || "Ghana").trim(),
    },
    items: normalizedItems,
    deliveryDate,
    deliveryTime: meta.deliveryTime ? String(meta.deliveryTime) : null,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalItems,
    paystackReference: tx.reference,
    paymentMethod: mapChannel(tx.channel),
    paymentStatus: "paid",
    orderStatus: "confirmed",
    vendor: "",
    createdAt: paidAt,
    updatedAt: paidAt,
  };

  // Omit orderNumber entirely: the live sparse-unique index treats an explicit
  // null as a duplicate, while absent fields are skipped by the sparse index.
  delete doc.orderNumber;

  return {
    placeholder: !hadItems,
    doc,
  };
}

async function fetchTransactions() {
  // Paystack's /transaction list endpoint ignores the from/to range params, so
  // we pull every successful transaction and filter client-side instead.
  const perPage = 100;
  const all = [];
  let page = 1;

  while (true) {
    const q = new URLSearchParams({ status: "success", perPage, page });
    const res = await fetch(`https://api.paystack.co/transaction?${q}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Paystack ${res.status}: ${text.slice(0, 200)}`);
    }
    const body = await res.json();
    if (!body.status) throw new Error(`Paystack error: ${body.message}`);
    all.push(...body.data);
    const totalPages = Math.max(1, Math.ceil((body.meta?.total ?? 0) / perPage));
    if (page >= totalPages || !body.data || body.data.length === 0) break;
    page++;
  }

  const fromMs = new Date(FROM + "T00:00:00Z").getTime();
  const toMs = new Date(TO + "T23:59:59Z").getTime();
  return all.filter((tx) => {
    const ts = new Date(tx.paid_at || tx.created_at).getTime();
    return Number.isFinite(ts) && ts >= fromMs && ts <= toMs;
  });
}

// --- audit-trail helper (mirrors src/lib/activityLogger.ts) ---

function hmacSecret() {
  return process.env.AUDIT_HMAC_SECRET || process.env.JWT_SECRET || "duks-activity-hmac";
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value === undefined ? null : value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalJson(v)).join(",") + "]";
  }
  const keys = Object.keys(value).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
}

function computeAuditHash(fields) {
  return crypto.createHmac("sha256", hmacSecret()).update(canonicalJson(fields)).digest("hex");
}

async function logReconciled(order) {
  const activitylogs = mongoose.connection.db.collection("activitylogs");
  const prev = (await activitylogs.findOne({}, { sort: { _id: -1 }, projection: { hash: 1 } })) || null;
  const previousHash = prev?.hash ?? null;
  const _id = new mongoose.Types.ObjectId();
  const createdAt = new Date();
  const fields = {
    id: _id,
    createdAt,
    previousHash,
    user: order.userId ?? null,
    email: order.customer.email,
    action: "order_reconciled",
    details: `Recovered order for ${order.customer.email} — GH₵ ${order.totalAmount.toFixed(2)} (payment was missing from orders)`,
    metadata: { orderId: order._id.toString(), totalAmount: order.totalAmount, reference: order.paystackReference },
    ip: null,
    isAdmin: false,
    route: null,
    method: null,
  };
  const hash = computeAuditHash(fields);
  await activitylogs.insertOne({
    _id,
    user: fields.user,
    email: fields.email,
    action: fields.action,
    details: fields.details,
    metadata: fields.metadata,
    ip: null,
    isAdmin: false,
    route: null,
    method: null,
    hash,
    previousHash,
    createdAt,
    updatedAt: createdAt,
  });
}

async function notifyNewOrder(order, email) {
  const notifications = mongoose.connection.db.collection("notifications");
  await notifications.insertOne({
    type: "new_order",
    title: "New Order Received",
    message: `${email} placed an order — GH₵ ${order.totalAmount.toFixed(2)} (recovered)`,
    link: "/admin/orders",
    read: false,
    metadata: { orderId: order._id.toString(), totalAmount: order.totalAmount, email, recovered: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// --- email (mirrors src/lib/email.ts) ---

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP not configured (missing SMTP_USER / SMTP_PASS)");
  }
  const from = process.env.EMAIL_FROM || `"Duks Juice Inc." <${process.env.SMTP_USER}>`;
  const info = await getTransporter().sendMail({ from, to, subject, html });
  console.log(`  ✉ email sent to ${to} (${info.messageId})`);
}

function customerEmailHtml(order) {
  const rows = order.items
    .map((it) => `<li>${it.quantity} × ${it.name} ${it.pack ? `(${it.pack})` : ""} — ₵${it.price.toFixed(2)}</li>`)
    .join("");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">Order Confirmed</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hi ${order.customer.fullName},</p>
        <p>Thank you for your order! Your payment has been confirmed.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
        </div>
        <h3>Order Summary:</h3>
        <ul style="padding-left: 20px;">${rows}</ul>
        <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #0f5132;">
          <p style="margin: 0; font-size: 20px; font-weight: bold;">Total: ₵${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  `;
}

function adminEmailHtml(order) {
  const rows = order.items
    .map((it) => `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${it.name}</strong>${it.pack ? `<br><small>Pack: ${it.pack}</small>` : ""}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${it.quantity}</td><td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₵${it.price.toFixed(2)}</td></tr>`)
    .join("");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
      <div style="background: #0f5132; color: #fff; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">New Order Received (Recovered)</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p><strong>Customer:</strong> ${order.customer.fullName} (${order.customer.email})</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead><tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd;">Product</th><th style="padding: 8px; border: 1px solid #ddd;">Qty</th><th style="padding: 8px; border: 1px solid #ddd;">Price</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-size: 20px; font-weight: bold; color: #0f5132;">Total: ₵${order.totalAmount.toFixed(2)}</p>
      </div>
    </div>
  `;
}

async function sendOrderEmails(order) {
  const jobs = [sendMail({ to: order.customer.email, subject: `Order Confirmed - ${order._id}`, html: customerEmailHtml(order) })];
  if (process.env.ADMIN_EMAIL) {
    jobs.push(sendMail({ to: process.env.ADMIN_EMAIL, subject: `New Order — ₵${order.totalAmount.toFixed(2)}`, html: adminEmailHtml(order) }));
  }
  await Promise.all(jobs);
}

// --- main ---

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  await mongoose.connect(uri);
  const orders = mongoose.connection.db.collection("orders");

  console.log(`Mode: ${WRITE ? "WRITE" : "DRY-RUN"} | window: ${FROM} → ${TO} | emails: ${SEND_EMAIL ? "on" : "off"}`);

  const txs = await fetchTransactions();
  console.log(`Fetched ${txs.length} successful Paystack transaction(s).`);

  const report = { from: FROM, to: TO, mode: WRITE ? "write" : "dry-run", scanned: txs.length, created: [], skipped: [], flagged: [], failed: [] };
  let createdCount = 0;
  let skippedCount = 0;
  let flaggedCount = 0;
  let failedCount = 0;

  for (const tx of txs) {
    const existing = await orders.findOne({ paystackReference: tx.reference });
    if (existing) {
      skippedCount++;
      report.skipped.push({ reference: tx.reference, email: tx.customer?.email, amount: (tx.amount || 0) / 100 });
      continue;
    }

    const { placeholder, doc } = buildOrder(tx);
    const entry = {
      reference: tx.reference,
      email: doc.customer.email,
      fullName: doc.customer.fullName,
      amount: doc.totalAmount,
      paymentMethod: doc.paymentMethod,
      paidAt: doc.createdAt.toISOString(),
      itemCount: doc.totalItems,
      placeholder,
    };

    if (placeholder) {
      flaggedCount++;
      report.flagged.push(entry);
    }

    if (!WRITE) {
      createdCount++;
      report.created.push(entry);
      console.log(`  [dry-run] would create ${tx.reference} → ${doc.customer.email} (GH₵ ${doc.totalAmount.toFixed(2)}, ${doc.paymentMethod})${placeholder ? " [PLACEHOLDER ITEMS]" : ""}`);
      continue;
    }

    try {
      const result = await orders.insertOne(doc);
      doc._id = result.insertedId;
      createdCount++;
      report.created.push(entry);
      console.log(`  ✓ created ${tx.reference} → ${doc.customer.email} (GH₵ ${doc.totalAmount.toFixed(2)}, ${doc.paymentMethod})`);

      await Promise.allSettled([
        (async () => { try { await logReconciled(doc); } catch (e) { console.warn(`  ⚠ activity log failed for ${tx.reference}: ${e.message}`); } })(),
        (async () => { try { await notifyNewOrder(doc, doc.customer.email); } catch (e) { console.warn(`  ⚠ notification failed for ${tx.reference}: ${e.message}`); } })(),
        (async () => {
          if (!SEND_EMAIL) return;
          try { await sendOrderEmails(doc); } catch (e) { console.warn(`  ⚠ email failed for ${tx.reference}: ${e.message}`); }
        })(),
      ]);
    } catch (err) {
      if (String(err.message).includes("E11000")) {
        skippedCount++;
        report.skipped.push({ reference: tx.reference, reason: "duplicate reference (created by an earlier run)" });
        console.warn(`  ⚠ duplicate key for ${tx.reference}: ${err.message}`);
      } else {
        failedCount++;
        report.failed.push({ reference: tx.reference, reason: err.message });
        console.error(`  ✗ failed ${tx.reference}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone: ${createdCount} created, ${skippedCount} already exist, ${flaggedCount} flagged (placeholder items), ${failedCount} failed.`);

  const fs = await import("node:fs/promises");
  await fs.writeFile("scripts/reconcile-report.json", JSON.stringify(report, null, 2));
  console.log("Report written to scripts/reconcile-report.json");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
