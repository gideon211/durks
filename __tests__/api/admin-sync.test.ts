import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { GET as getStats } from "@/app/api/orders/admin/stats/route";
import { GET as getPayments } from "@/app/api/orders/admin/payments/route";
import { GET as getTrend } from "@/app/api/orders/admin/revenue-trend/route";
import { GET as getCustomers } from "@/app/api/orders/admin/customers/route";
import { GET as getCategories } from "@/app/api/drinks/stats/category/route";
import Order from "@/models/order";
import { createTestAdmin, createTestDrink, authHeader, connectTestDB, clearCollections } from "../helpers";

jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
}));

const DRINK_ID = new mongoose.Types.ObjectId();

function adminReq(token: string, path: string) {
  return new NextRequest(`http://localhost${path}`, {
    method: "GET",
    headers: authHeader(token),
  });
}

function seedOrder(
  overrides: Partial<{
    customer: { fullName: string; email: string; phone: string; address: string; city: string; country: string };
    totalAmount: number;
    paystackReference: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    createdAt: Date;
  }>
) {
  const { customer, ...rest } = overrides;
  return Order.create({
    userId: null,
    customer: customer ?? {
      fullName: "Test Customer",
      email: "customer@test.com",
      phone: "0200000000",
      address: "Test Road",
      city: "Accra",
      country: "Ghana",
    },
    items: [{ drinkId: DRINK_ID, name: "Test Juice", pack: "Pack", price: 10, quantity: 1 }],
    totalAmount: 100,
    paystackReference: "ref-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    paymentMethod: "Card",
    paymentStatus: "pending",
    orderStatus: "confirmed",
    ...rest,
  });
}

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

describe("Admin dashboard sync", () => {
  it("stats returns paid-only revenue and new dashboard fields", async () => {
    const admin = await createTestAdmin();
    const token = await admin.token;

    await seedOrder({ customer: { fullName: "A", email: "a@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 100, paystackReference: "COD-aaaa-1", paymentMethod: "Cash on Delivery", paymentStatus: "pending", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "A2", email: "a@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 200, paystackReference: "ref-card-b", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "B", email: "b@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 300, paystackReference: "ref-card-c", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "C", email: "c@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 400, paystackReference: "ref-card-d", paymentStatus: "pending", orderStatus: "pending" });

    const res = await getStats(adminReq(token, "/api/orders/admin/stats"));
    const body = await res.json();
    const s = body.stats;

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(s.totalOrders).toBe(4);
    expect(s.paidOrders).toBe(2);
    expect(s.totalRevenue).toBe(500);
    expect(s.ordersThisWeek).toBe(4);
    expect(s.revenueThisWeek).toBe(500);
    expect(s.pendingOrders).toBe(4);
    expect(s.repeatPurchaseRate).toBeCloseTo(1 / 3, 5);
    expect(s.customerLifetimeValue).toBeCloseTo(500 / 3, 5);
    expect(typeof s.preorderRatio).toBe("number");
    expect(s.recentOrders).toBeUndefined();
  });

  it("payments returns real payment records with derived method", async () => {
    const admin = await createTestAdmin();
    const token = await admin.token;

    await seedOrder({ customer: { fullName: "COD Guy", email: "cod@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 120, paystackReference: "COD-" + Date.now(), paymentMethod: "Cash on Delivery", paymentStatus: "pending", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "Card Guy", email: "card@test.com", phone: "1", address: "x", city: "Accra", country: "Ghana" }, totalAmount: 240, paystackReference: "ref-paystack-1", paymentStatus: "paid", orderStatus: "confirmed" });

    const res = await getPayments(adminReq(token, "/api/orders/admin/payments"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.payments)).toBe(true);
    expect(body.payments.length).toBe(2);

    const cod = body.payments.find((p: { paystackReference: string }) => String(p.paystackReference).startsWith("COD-"));
    const card = body.payments.find((p: { paystackReference: string }) => String(p.paystackReference).startsWith("ref-"));

    expect(cod).toBeDefined();
    expect(cod.paymentMethod).toBe("Cash on Delivery");
    expect(cod.customer.fullName).toBe("COD Guy");
    expect(cod.totalAmount).toBe(120);

    expect(card).toBeDefined();
    expect(card.paymentMethod).toBe("Card");
    expect(card.customer.fullName).toBe("Card Guy");
  });

  it("revenue-trend returns last-30-days paid-only daily buckets", async () => {
    const admin = await createTestAdmin();
    const token = await admin.token;

    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    await seedOrder({ totalAmount: 999, paystackReference: "old-1", paymentStatus: "paid", orderStatus: "confirmed", createdAt: sixtyDaysAgo });
    await seedOrder({ totalAmount: 200, paystackReference: "recent-paid", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ totalAmount: 300, paystackReference: "recent-pending", paymentStatus: "pending", orderStatus: "confirmed" });

    const res = await getTrend(adminReq(token, "/api/orders/admin/revenue-trend"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.trend)).toBe(true);
    expect(body.trend.length).toBe(30);

    const totalRevenue = body.trend.reduce((sum: number, d: { revenue: number }) => sum + (d.revenue || 0), 0);
    expect(totalRevenue).toBe(200);

    const paidDay = body.trend.find((d: { revenue: number }) => d.revenue === 200);
    expect(paidDay).toBeDefined();
    const pendingDay = body.trend.find((d: { revenue: number }) => d.revenue === 300);
    expect(pendingDay).toBeUndefined();

    for (const point of body.trend) {
      expect(typeof point.date).toBe("string");
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof point.revenue).toBe("number");
    }
  });

  it("customers returns checkout details grouped by email with paid-only spend", async () => {
    const admin = await createTestAdmin();
    const token = await admin.token;

    await seedOrder({ customer: { fullName: "Clarice Nyan", email: "claricenyan@yahoo.com", phone: "0244000000", address: "Cantonments", city: "Accra", country: "Ghana" }, totalAmount: 1000, paystackReference: "ref-clarice-1", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "Clarice Nyan", email: "claricenyan@yahoo.com", phone: "0244000000", address: "Cantonments", city: "Accra", country: "Ghana" }, totalAmount: 180, paystackReference: "ref-clarice-2", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "Ivy Duku Plange", email: "iduplange@gmail.com", phone: "0201111111", address: "East Legon", city: "Accra", country: "Ghana" }, totalAmount: 120, paystackReference: "ref-ivy-1", paymentStatus: "paid", orderStatus: "confirmed" });
    await seedOrder({ customer: { fullName: "Guest Unpaid", email: "guest@test.com", phone: "0502222222", address: "Tema", city: "Tema", country: "Ghana" }, totalAmount: 999, paystackReference: "COD-guest-1", paymentMethod: "Cash on Delivery", paymentStatus: "pending", orderStatus: "confirmed" });

    const res = await getCustomers(adminReq(token, "/api/orders/admin/customers"));
    const body = await res.json();

    expect(res.status).toBe(200);
    const byEmail = Object.fromEntries(body.customers.map((c: { email: string }) => [c.email, c]));

    expect(byEmail["claricenyan@yahoo.com"]).toMatchObject({
      fullName: "Clarice Nyan",
      name: "Clarice Nyan",
      phone: "0244000000",
      city: "Accra",
      orders: 2,
      totalSpent: 1180,
    });
    expect(byEmail["iduplange@gmail.com"]).toMatchObject({
      fullName: "Ivy Duku Plange",
      phone: "0201111111",
      city: "Accra",
      orders: 1,
      totalSpent: 120,
    });
    expect(byEmail["guest@test.com"]).toBeUndefined();
    expect(body.customers.length).toBe(2);
  });

  it("category stats returns {name, count} grouped by category and requires admin", async () => {
    const admin = await createTestAdmin();
    const token = await admin.token;

    await createTestDrink({ name: "Mango Juice", category: "pure-juice" });
    await createTestDrink({ name: "Pineapple Juice", category: "pure-juice" });
    await createTestDrink({ name: "Carrot Blend", category: "fresh-blends" });
    await createTestDrink({ name: "Uncategorized", category: "" });

    const res = await getCategories(adminReq(token, "/api/drinks/stats/category"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.categories).toEqual([
      { name: "pure-juice", count: 2 },
      { name: "fresh-blends", count: 1 },
    ]);

    const unauthorized = await getCategories(new NextRequest("http://localhost/api/drinks/stats/category", { headers: {} }));
    expect(unauthorized.status).toBe(401);
  });
});
