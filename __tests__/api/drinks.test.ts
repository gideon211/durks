import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/drinks/route";
import { createTestUser, createTestAdmin, createTestDrink, authHeader, connectTestDB, clearCollections } from "../helpers";

function makeReq(method: string, body?: unknown, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost/api/drinks`, {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

describe("Drinks API", () => {
  describe("GET /api/drinks", () => {
    it("returns 200 with list of drinks", async () => {
      await createTestDrink({ name: "Mango Juice" });
      await createTestDrink({ name: "Apple Juice", category: "pure-juice" });

      const req = makeReq("GET");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.drinks).toHaveLength(2);
    });

    it("returns empty array when no drinks exist", async () => {
      const req = makeReq("GET");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.drinks).toHaveLength(0);
    });
  });

  describe("POST /api/drinks", () => {
    it("returns 201 when admin creates a drink", async () => {
      const { token } = await createTestAdmin();

      const req = makeReq("POST", {
        name: "New Juice",
        category: "smoothies",
        packs: [{ pack: 6, price: 15.0 }],
      }, authHeader(token));

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.drink.name).toBe("New Juice");
    });

    it("returns 403 when non-admin tries to create", async () => {
      const { token } = await createTestUser();

      const req = makeReq("POST", {
        name: "Hack Juice",
        packs: [{ pack: 6, price: 15.0 }],
      }, authHeader(token));

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("returns 400 when name or packs missing", async () => {
      const { token } = await createTestAdmin();

      const req = makeReq("POST", { name: "No Packs" }, authHeader(token));
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
