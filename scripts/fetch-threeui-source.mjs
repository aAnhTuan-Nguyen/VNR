import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const manifestUrl = "https://threeui.com/source-code/complete-shelf-landing-page.json";
const canonicalUrl = "https://threeui.com/landing-pages/complete-shelf-v2.html";

const expectedHashes = new Map([
  ["src/shaders/landing-pages/LandingPages.tsx", "7fdacf75a4715b0b6aea50a889422af9aa45f5c1771a7e1bbc59a6e2dd036704"],
  ["src/shaders/landing-pages/LandingPageFrame.tsx", "61de2cc50888aac4ac5557420b07fa47ed3543bb57c1e0055fafdefa53dbaa78"],
  ["public/landing-pages/complete-shelf-v2.html", "606f200fed8602c243f40a11c8c364f0e625c57f80e7c97dc76419da207f198e"],
  ["src/shaders/threeui.css", "efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf"],
]);

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function fetchOk(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response;
}

const manifest = await (await fetchOk(manifestUrl)).json();
const records = new Map(manifest.files.map((file) => [file.path, file]));
const verified = new Map();

for (const [relativePath, expectedHash] of expectedHashes) {
  let bytes;
  if (relativePath === "public/landing-pages/complete-shelf-v2.html") {
    bytes = Buffer.from(await (await fetchOk(canonicalUrl)).arrayBuffer());
  } else {
    const record = records.get(relativePath);
    if (!record || typeof record.code !== "string") {
      throw new Error(`Registered source is missing code for ${relativePath}`);
    }
    bytes = Buffer.from(record.code, "utf8");
  }

  const actualHash = digest(bytes);
  if (actualHash !== expectedHash) {
    throw new Error(`${relativePath} hash mismatch: expected ${expectedHash}, received ${actualHash}`);
  }
  verified.set(relativePath, bytes);
}

for (const [relativePath, bytes] of verified) {
  const destination = path.resolve(process.cwd(), relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  console.log(`${relativePath} ${digest(bytes)}`);
}
