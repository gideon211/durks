import { NextRequest } from "next/server";
import { POST } from "@/app/api/drinks/add/route";
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

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

describe("POST /api/drinks/add", () => {
  it("returns 201 when admin creates a drink from multipart form data", async () => {
    const { token } = await createTestAdmin();

    const req = makeFormReq(token, {
      name: "Mango Sunrise",
      category: "pure-juice",
      description: "Fresh mango",
      size: "300ml",
      status: "Active",
      packs: JSON.stringify([{ pack: 6, price: 15.0 }]),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.drink.name).toBe("Mango Sunrise");
    expect(data.drink.status).toBe("active");
    expect(data.drink.packs).toHaveLength(1);
  });

  it("returns 401 without a valid token", async () => {
    const req = makeFormReq("not-a-token", {
      name: "Hack Juice",
      packs: JSON.stringify([{ pack: 6, price: 10.0 }]),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-admin tries to create", async () => {
    const { token } = await createTestUser();

    const req = makeFormReq(token, {
      name: "Hack Juice",
      packs: JSON.stringify([{ pack: 6, price: 10.0 }]),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when name is missing", async () => {
    const { token } = await createTestAdmin();

    const req = makeFormReq(token, {
      packs: JSON.stringify([{ pack: 6, price: 10.0 }]),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when a pack is missing a price", async () => {
    const { token } = await createTestAdmin();

    const req = makeFormReq(token, {
      name: "Broken Pack",
      packs: JSON.stringify([{ pack: 6 }]),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
