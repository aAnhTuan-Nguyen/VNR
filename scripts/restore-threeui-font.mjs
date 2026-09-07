import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const packageCssPath = path.resolve(
  process.cwd(),
  "node_modules/@designcodeio/threeui/lib-dist/style.css",
);
const packageCss = await readFile(packageCssPath, "utf8");
const fontMatch = packageCss.match(/ThreeUI Fragment Mono[\s\S]*?base64,([^)]*)\)/);

if (!fontMatch) {
  throw new Error("The official ThreeUI package does not contain the Fragment Mono font asset.");
}

const fontPath = path.resolve(process.cwd(), "src/shaders/fonts/fragment-mono.woff2");
await mkdir(path.dirname(fontPath), { recursive: true });
await writeFile(fontPath, Buffer.from(fontMatch[1], "base64"));
console.log(fontPath);
