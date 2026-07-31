import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { GET as getActivityLogs } from "@/app/api/activity-logs/route";
import { GET as verifyActivityLogs } from "@/app/api/activity-logs/verify/route";
import { POST as addDrink } from "@/app/api/drinks/add/route";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as createOrder } from "@/app/api/orders/route";
import { POST as submitContact } from "@/app/api/contact/route";
import { PATCH as markNotificationRead } from "@/app/api/notifications/[id]/read/route";
import { logError, verifyAuditChain } from "@/lib/activityLogger";
import ActivityLog from "@/models/ActivityLog";
import Notification from "@/models/Notification";
import { createTestUser, createTestAdmin, authHeader, connectTestDB, clearCollections } from "../helpers";

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
}));

function makeFormReq(token: string, fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return new NextRequest(`http://localhost/api/drinks/add`, {
    method: "POST",
    headers: authHeader(token),
    body: fd,
  });
}

function makeLogReq(token: string) {
  return new NextRequest(`http://localhost/api/activity-logs`, {
    method: "GET",
    headers: authHeader(token),
  });
}

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

type AuditLogRow = {
  isAdmin: boolean;
  email: string | null;
  ip: string | null;
  route: string | null;
  method: string | null;
  details: string;
};

async function findLog(action: string): Promise<AuditLogRow | null> {
  return (await ActivityLog.findOne({ action }).lean()) as AuditLogRow | null;
}

describe("Activity log audit trail", () => {
  it("records admin mutations with actor attribution (isAdmin, email, route, method)", async () => {
    const { token, user } = await createTestAdmin();

    const res = await addDrink(
      makeFormReq(token, {
        name: "Audit Juice",
        category: "pure-juice",
        packs: JSON.stringify([{ pack: 6, price: 12.0 }]),
      })
    );
    expect(res.status).toBe(201);

    const log = await findLog("create_drink");
    expect(log).not.toBeNull();
    expect(log!.isAdmin).toBe(true);
    expect(log!.email).toBe(user.email);
    expect(log!.route).toBe("/api/drinks/add");
    expect(log!.method).toBe("POST");
  });

  it("records customer signup with email and IP", async () => {
    const req = new NextRequest("http://localhost/api/auth/signup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "203.0.113.5",
      },
      body: JSON.stringify({ username: "audituser", email: "audit@test.com", password: "password123" }),
    });

    const res = await signup(req);
    expect(res.status).toBe(201);

    const log = await findLog("signup");
    expect(log).not.toBeNull();
    expect(log!.email).toBe("audit@test.com");
    expect(log!.ip).toBe("203.0.113.5");
    expect(log!.isAdmin).toBe(false);
  });

  it("allows admins to read activity logs", async () => {
    const { token } = await createTestAdmin();
    const res = await getActivityLogs(makeLogReq(token));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.logs)).toBe(true);
  });

  it("rejects non-admin log readers with 403", async () => {
    const { token } = await createTestUser();
    const res = await getActivityLogs(makeLogReq(token));
    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated log readers with 401", async () => {
    const res = await getActivityLogs(new NextRequest("http://localhost/api/activity-logs", { method: "GET" }));
    expect(res.status).toBe(401);
  });

  it("handles legacy string user values without crashing reads", async () => {
    const { token } = await createTestAdmin();
    await ActivityLog.create({
      user: "not-an-object-id",
      email: "legacy@test.com",
      action: "order_placed",
      details: "Legacy entry with malformed user reference",
      route: "/api/orders",
      method: "POST",
    });

    const res = await getActivityLogs(makeLogReq(token));
    expect(res.status).toBe(200);
    const data = await res.json();
    const entry = data.logs.find((l: { action: string }) => l.action === "order_placed");
    expect(entry).toBeDefined();
    expect(entry.user).toBeNull();
  });

  it("records api_error entries with endpoint and error message", async () => {
    const req = new NextRequest("http://localhost/api/drinks/add", {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.9" },
    });
    await logError({
      req,
      error: new Error("connection reset"),
      status: 500,
      actor: { id: "abc123", email: "admin@test.com", isAdmin: true },
    });

    const log = await findLog("api_error");
    expect(log).not.toBeNull();
    expect(log!.details).toContain("POST /api/drinks/add");
    expect(log!.details).toContain("connection reset");
    expect(log!.isAdmin).toBe(true);
    expect(log!.email).toBe("admin@test.com");
  });

  it("links logs into a verifiable hash chain", async () => {
    const { token } = await createTestAdmin();
    await addDrink(
      makeFormReq(token, {
        name: "Chain Juice",
        category: "pure-juice",
        packs: JSON.stringify([{ pack: 6, price: 10.0 }]),
      })
    );

    const logs = (await ActivityLog.find({}).sort({ _id: 1 }).lean()) as unknown as Array<{
      hash: string | null;
      previousHash: string | null;
    }>;
    const hashed = logs.filter((l) => l.hash);
    expect(hashed.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < hashed.length; i++) {
      expect(hashed[i].previousHash).toBe(hashed[i - 1].hash);
    }

    const result = await verifyAuditChain();
    expect(result.valid).toBe(true);
  });

  it("detects tampering of log entries", async () => {
    const { token } = await createTestAdmin();
    await addDrink(
      makeFormReq(token, {
        name: "Tamper Juice",
        category: "pure-juice",
        packs: JSON.stringify([{ pack: 6, price: 10.0 }]),
      })
    );

    await ActivityLog.updateOne({ action: "create_drink" }, { $set: { details: "ALTERED" } });

    const result = await verifyAuditChain();
    expect(result.valid).toBe(false);
  });

  it("returns audit chain status from the verify endpoint", async () => {
    const { token } = await createTestAdmin();
    const res = await verifyActivityLogs(
      new NextRequest("http://localhost/api/activity-logs/verify", { headers: authHeader(token) })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(typeof data.checked).toBe("number");
  });

  it("records COD order_created with verified actor attribution", async () => {
    const { token, user } = await createTestUser();
    const res = await createOrder(
      new NextRequest("http://localhost/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json", ...authHeader(token), "x-forwarded-for": "198.51.100.7" },
        body: JSON.stringify({
          customer: { fullName: "Test User", email: user.email, phone: "0500000000", city: "Accra", address: "1 Test St" },
          items: [{ drinkId: new mongoose.Types.ObjectId().toString(), name: "Test Juice", pack: "1", price: 10, quantity: 2 }],
          totalAmount: 20,
        }),
      })
    );
    expect(res.status).toBe(201);

    const log = await findLog("order_created");
    expect(log).not.toBeNull();
    expect(log!.isAdmin).toBe(false);
    expect(log!.email).toBe(user.email);
    expect(log!.route).toBe("/api/orders");
    expect(log!.method).toBe("POST");
  });

  it("records contact form submissions", async () => {
    const res = await submitContact(
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.3" },
        body: JSON.stringify({ name: "Jane Doe", email: "jane@test.com", subject: "Wholesale", message: "Hi there" }),
      })
    );
    expect(res.status).toBe(200);

    const log = await findLog("contact_submitted");
    expect(log).not.toBeNull();
    expect(log!.email).toBe("jane@test.com");
    expect(log!.ip).toBe("198.51.100.3");
  });

  it("marks notifications read via the route and logs the action", async () => {
    const { token } = await createTestAdmin();
    const notif = await Notification.create({
      type: "new_order",
      title: "New Order #1",
      message: "A new order arrived",
      read: false,
    });

    const res = await markNotificationRead(
      new NextRequest(`http://localhost/api/notifications/${notif._id}/read`, {
        method: "PATCH",
        headers: authHeader(token),
      }),
      { params: Promise.resolve({ id: notif._id.toString() }) }
    );
    expect(res.status).toBe(200);

    const updated = (await Notification.findById(notif._id).lean()) as { read: boolean } | null;
    expect(updated!.read).toBe(true);

    const log = await findLog("mark_notification_read");
    expect(log).not.toBeNull();
    expect(log!.isAdmin).toBe(true);
  });
});
