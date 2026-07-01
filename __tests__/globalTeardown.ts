import * as fs from "fs";
import * as path from "path";

const URI_FILE = path.join(__dirname, ".test-mongo-uri");

export default async function globalTeardown() {
  try {
    fs.unlinkSync(URI_FILE);
  } catch {}
}
