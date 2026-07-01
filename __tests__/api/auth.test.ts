import { NextRequest } from "next/server";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as getMe } from "@/app/api/auth/me/route";
import { createTestUser, createTestAdmin, authHeader, connectTestDB, clearCollections } from "../helpers";

function makeReq(method: string, body?: unknown, headers?: Record<string, string>) {
  return new NextRequest(`http://localhost/api/auth/test`, {
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

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("returns 201 with token and user on valid signup", async () => {
      const req = makeReq("POST", { username: "newuser", email: "new@test.com", password: "pass1234" });
      const res = await signup(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.token).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user.username).toBe("newuser");
      expect(data.user.email).toBe("new@test.com");
      expect(data.role).toBe("user");
    });

    it("returns 400 if fields are missing", async () => {
      const req = makeReq("POST", { email: "test@test.com" });
      const res = await signup(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 if email already registered", async () => {
      await createTestUser({ email: "dup@test.com" });
      const req = makeReq("POST", { username: "dup", email: "dup@test.com", password: "pass1234" });
      const res = await signup(req);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 200 with token for valid credentials", async () => {
      await createTestUser({ email: "login@test.com", password: "mypassword" });
      const req = makeReq("POST", { email: "login@test.com", password: "mypassword" });
      const res = await login(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("login@test.com");
    });

    it("returns 404 if user not found", async () => {
      const req = makeReq("POST", { email: "nobody@test.com", password: "pass" });
      const res = await login(req);
      expect(res.status).toBe(404);
    });

    it("returns 400 for wrong password", async () => {
      await createTestUser({ email: "wrong@test.com", password: "correct" });
      const req = makeReq("POST", { email: "wrong@test.com", password: "incorrect" });
      const res = await login(req);
      expect(res.status).toBe(400);
    });

    it("admin login returns admin role", async () => {
      const req = makeReq("POST", { email: "admin@test.com", password: "Admin123" });
      const res = await login(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.role).toBe("admin");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 200 with user data when authenticated", async () => {
      const { user, token } = await createTestUser();
      const req = makeReq("GET", undefined, authHeader(token));
      const res = await getMe(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.user.email).toBe(user.email);
    });

    it("returns 401 when no token", async () => {
      const req = makeReq("GET");
      const res = await getMe(req);
      expect(res.status).toBe(401);
    });

    it("returns 401 with invalid token", async () => {
      const req = makeReq("GET", undefined, authHeader("invalid-token"));
      const res = await getMe(req);
      expect(res.status).toBe(401);
    });
  });
});
