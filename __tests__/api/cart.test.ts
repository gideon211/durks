import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { GET, POST, DELETE } from "@/app/api/cart/route";
import { createTestUser, createTestDrink, authHeader, connectTestDB, clearCollections } from "../helpers";

function makeReq(method: string, body?: unknown, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost/api/cart`, {
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

describe("Cart API", () => {
  describe("GET /api/cart", () => {
    it("returns 200 with cart items for authenticated user", async () => {
      const { token } = await createTestUser();
      const drink = await createTestDrink();

      const addReq = makeReq("POST", { drinkId: drink._id.toString(), quantity: 2, pack: 12 }, authHeader(token));
      await POST(addReq);

      const req = makeReq("GET", undefined, authHeader(token));
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.cartItems).toHaveLength(1);
    });

    it("returns 500 when not authenticated", async () => {
      const req = makeReq("GET");
      const res = await GET(req);
      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/cart", () => {
    it("returns 201 when adding valid drink", async () => {
      const { token } = await createTestUser();
      const drink = await createTestDrink();

      const req = makeReq("POST", { drinkId: drink._id.toString(), quantity: 1, pack: 12 }, authHeader(token));
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toBe("Added to cart");
    });

    it("returns 404 when drink doesn't exist", async () => {
      const { token } = await createTestUser();
      const fakeId = new mongoose.Types.ObjectId().toString();

      const req = makeReq("POST", { drinkId: fakeId, quantity: 1, pack: 12 }, authHeader(token));
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it("merges quantity when same drink+pack already in cart", async () => {
      const { token } = await createTestUser();
      const drink = await createTestDrink();

      const req1 = makeReq("POST", { drinkId: drink._id.toString(), quantity: 1, pack: 12 }, authHeader(token));
      await POST(req1);

      const req2 = makeReq("POST", { drinkId: drink._id.toString(), quantity: 3, pack: 12 }, authHeader(token));
      await POST(req2);

      const getReq = makeReq("GET", undefined, authHeader(token));
      const getRes = await GET(getReq);
      const data = await getRes.json();
      expect(data.cartItems).toHaveLength(1);
      expect(data.cartItems[0].qty).toBe(4);
    });
  });

  describe("DELETE /api/cart", () => {
    it("clears all cart items", async () => {
      const { token } = await createTestUser();
      const drink = await createTestDrink();

      const addReq = makeReq("POST", { drinkId: drink._id.toString(), quantity: 2, pack: 12 }, authHeader(token));
      await POST(addReq);

      const delReq = makeReq("DELETE", undefined, authHeader(token));
      const delRes = await DELETE(delReq);
      expect(delRes.status).toBe(200);

      const getReq = makeReq("GET", undefined, authHeader(token));
      const getRes = await GET(getReq);
      const data = await getRes.json();
      expect(data.cartItems).toHaveLength(0);
    });
  });
});
