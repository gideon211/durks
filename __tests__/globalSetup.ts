import { MongoMemoryServer } from "mongodb-memory-server";
import * as fs from "fs";
import * as path from "path";

const URI_FILE = path.join(__dirname, ".test-mongo-uri");

export default async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  fs.writeFileSync(URI_FILE, uri);
}
