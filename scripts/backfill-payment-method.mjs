// One-off backfill: populate the paymentMethod field on historical orders
// from Paystack's transaction verify API.
//
// Run: node --env-file=.env.local scripts/backfill-payment-method.mjs
// Idempotent: only touches orders where paymentMethod is missing/empty and the
// reference is not a COD reference.

import mongoose from "mongoose";
import dns from "node:dns";

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean));
}

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

const CONCURRENCY = 5;

function mapChannel(channel) {
  const c = String(channel || "").trim();
  return c ? (PAYMENT_METHOD_LABELS[c] ?? c) : null;
}

async function verifyChannel(reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack ${res.status}: ${text.slice(0, 120)}`);
  }
  const body = await res.json();
  if (!body.status) throw new Error(`Paystack error: ${body.message}`);
  return body.data?.channel ?? null;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

  await mongoose.connect(uri);
  const orders = mongoose.connection.db.collection("orders");

  const docs = await orders
    .find({
      paymentMethod: { $in: [null, ""] },
      paystackReference: { $not: /^COD-/ },
    })
    .project({ paystackReference: 1 })
    .toArray();

  console.log(`Found ${docs.length} order(s) missing a payment method.`);

  let updated = 0;
  let noChannel = 0;
  let failed = 0;
  let idx = 0;

  async function worker() {
    while (idx < docs.length) {
      const i = idx++;
      const doc = docs[i];
      try {
        const channel = await verifyChannel(doc.paystackReference);
        const label = mapChannel(channel);
        if (!label) {
          noChannel++;
          console.log(`  [${i + 1}/${docs.length}] ${doc.paystackReference}: no channel returned`);
          continue;
        }
        await orders.updateOne({ _id: doc._id }, { $set: { paymentMethod: label } });
        updated++;
        console.log(`  [${i + 1}/${docs.length}] ${doc.paystackReference} -> ${label}`);
      } catch (err) {
        failed++;
        console.error(`  [${i + 1}/${docs.length}] ${doc.paystackReference}: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`\nDone: ${updated} updated, ${noChannel} no channel, ${failed} failed.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
