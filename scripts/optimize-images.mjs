// Converts images to WebP (max 1920px, under 1 MB) and regenerates the
// size manifest used by <SiteImage>.
//
//   npm run images                 # optimise anything new in public/images
//   npm run images -- path/to/dir  # import a folder of raw images into public/images

import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT_DIR = path.join(ROOT, "public", "images");
const MANIFEST = path.join(ROOT, "app", "_data", "image-sizes.json");
const MAX_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1920;
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff"]);

const inputDir = path.resolve(ROOT, process.argv[2] ?? OUTPUT_DIR);

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat().sort();
}

async function encode(input) {
  let dimension = MAX_DIMENSION;
  for (;;) {
    for (const quality of [80, 72, 64, 56, 48]) {
      const buffer = await sharp(input)
        .rotate()
        .resize({ width: dimension, height: dimension, fit: "inside", withoutEnlargement: true })
        .webp({ quality, effort: 5 })
        .toBuffer();
      if (buffer.length < MAX_BYTES) return buffer;
    }
    dimension = Math.round(dimension * 0.8);
  }
}

async function isOptimised(file, target) {
  if (file !== target || (await stat(file)).size >= MAX_BYTES) return false;
  const { width, height } = await sharp(file).metadata();
  return Math.max(width, height) <= MAX_DIMENSION;
}

async function convert() {
  const written = new Set();
  const files = (await walk(inputDir)).filter((file) =>
    SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );

  for (const file of files) {
    const rel = path.relative(inputDir, file);
    const ext = path.extname(rel);
    const dirs = path.dirname(rel).split(path.sep).filter((part) => part !== ".").map(slugify);
    let base = slugify(path.basename(rel, ext));
    let target = path.join(OUTPUT_DIR, ...dirs, `${base}.webp`);
    if (written.has(target)) {
      base = `${base}-${slugify(ext)}`;
      target = path.join(OUTPUT_DIR, ...dirs, `${base}.webp`);
    }

    if (!(await isOptimised(file, target))) {
      const buffer = await encode(file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, buffer);
      console.log(`${rel} -> ${path.relative(ROOT, target)} (${Math.round(buffer.length / 1024)} KB)`);
      if (file.startsWith(OUTPUT_DIR) && file !== target) await rm(file);
    }
    written.add(target);
  }
}

async function writeManifest() {
  const manifest = {};
  for (const file of await walk(OUTPUT_DIR)) {
    if (path.extname(file) !== ".webp") continue;
    const { width, height } = await sharp(file).metadata();
    manifest[`/${path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/")}`] = [width, height];
  }
  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(manifest).length} entries to ${path.relative(ROOT, MANIFEST)}`);
}

await mkdir(OUTPUT_DIR, { recursive: true });
await convert();
await writeManifest();
