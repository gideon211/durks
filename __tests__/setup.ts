import * as fs from "fs";
import * as path from "path";

const URI_FILE = path.join(__dirname, ".test-mongo-uri");

// Read the MongoDB URI written by globalSetup
const uri = fs.readFileSync(URI_FILE, "utf-8").trim();
process.env.MONGODB_URI = uri;

// Set env vars
process.env.JWT_SECRET = "test-jwt-secret";
process.env.REFRESH_SECRET = "test-refresh-secret";
process.env.ADMIN_EMAIL_1 = "admin@test.com";
process.env.ADMIN_PASSWORD_1 = "Admin123";
process.env.ADMIN_EMAIL_2 = "admin2@test.com";
process.env.ADMIN_PASSWORD_2 = "Admin456";
process.env.ADMIN_EMAIL_3 = "admin3@test.com";
process.env.ADMIN_PASSWORD_3 = "Admin789";
