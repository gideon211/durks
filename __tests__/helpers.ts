import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import Drink from "@/models/drinks";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function connectTestDB() {
  await connectDB();
}

export async function disconnectTestDB() {
  await mongoose.disconnect();
}

export async function clearCollections() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export function signTestToken(payload: { id: string; isAdmin: boolean }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createTestUser(overrides: Partial<{ username: string; email: string; password: string; isAdmin: boolean }> = {}) {
  const { username = "testuser", email = "test@test.com", password = "password123", isAdmin = false } = overrides;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash, isAdmin });
  const token = signTestToken({ id: user._id.toString(), isAdmin: user.isAdmin });
  return { user, token, password };
}

export async function createTestAdmin() {
  return createTestUser({ username: "admin", email: "admin@test.com", password: "Admin123", isAdmin: true });
}

export async function createTestDrink(overrides: Partial<{ name: string; category: string; packs: Array<{ pack: number; price: number }> }> = {}) {
  const { name = "Test Juice", category = "pure-juice", packs = [{ pack: 12, price: 25.0 }] } = overrides;
  return Drink.create({ name, category, packs, available: true, status: "active" });
}
