import { NextRequest } from "next/server";
import { GET as getActivityLogs } from "@/app/api/activity-logs/route";
import { POST as addDrink } from "@/app/api/drinks/add/route";
import { POST as signup } from "@/app/api/auth/signup/route";
import ActivityLog from "@/models/ActivityLog";
import { createTestUser, createTestAdmin, authHeader, connectTestDB, clearCollections } from "../helpers";

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
});
