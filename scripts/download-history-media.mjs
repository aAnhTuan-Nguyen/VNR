import { writeFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Only new files for the content sidecar; never overwrite the original 12 JPGs.
const files = [
  ["nguyen-ai-quoc-tours-1920.jpg", "Comrade Nguyen Ai Quoc at the national congress of the Socialist Party of France in the city of Tous, France in December 1920.jpg", "Public domain"],
  ["saigon-evacuation-1975.jpg", "The air evacuation of siege-stricken Vietnamese from Saigon to the U.S. was conducted after the Babylift operation.... - NARA - 542335.tif", "Public domain"],
  // Commons rounds this portrait to a 960px bucket unless 330px is requested.
  ["hanoi-street-1999.jpg", "Vietnam 1999.Hanoi (18).jpg", "CC BY 4.0", 330],
  ["ho-chi-minh-city-2022.jpg", "Ho Chi Minh City Skyline 2022 (1).jpg", "CC BY-SA 4.0"],
  ["da-nang-dragon-bridge-2015.jpg", "Da Nang - Dragon Bridge.jpg", "CC BY 4.0"],
  ["hanoi-le-duc-tho-station-2024.jpg", "レドゥクト駅の駅舎.jpg", "CC BY 4.0"],
];
const headers = { "User-Agent": "VNR-HistoryMuseum/1.0 (educational history catalog; Wikimedia Commons media)" };
for (const [name, title, license, width = 1280] of files) {
  const destination = new URL(`../public/assets/museum/history/${name}`, import.meta.url);
  const existing = await stat(destination).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  if (existing) {
    console.log(`Preserved ${name} (${existing.size} bytes)`);
    continue;
  }
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.search = new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: String(width), titles: `File:${title}` }).toString();
  const response = await fetch(api, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Commons metadata: HTTP ${response.status}`);
  const data = await response.json();
  const info = Object.values(data.query.pages)[0].imageinfo?.[0];
  if (!info || info.extmetadata.LicenseShortName?.value !== license) {
    throw new Error(`License changed or file missing: ${title}; review its description page`);
  }
  const download = await fetch(info.thumburl, { headers, signal: AbortSignal.timeout(30000) });
  if (!download.ok) throw new Error(`Image download: HTTP ${download.status} (${title})`);
  const bytes = Buffer.from(await download.arrayBuffer());
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes.length > 2_000_000) {
    throw new Error(`Expected a small JPEG thumbnail: ${title}`);
  }
  await writeFile(destination, bytes, { flag: "wx" });
  console.log(JSON.stringify({ path: fileURLToPath(destination), bytes: bytes.length, requestedWidth: width, source: info.descriptionurl, date: info.extmetadata.DateTimeOriginal?.value, author: info.extmetadata.Artist?.value, license, licenseUrl: info.extmetadata.LicenseUrl?.value }));
}
