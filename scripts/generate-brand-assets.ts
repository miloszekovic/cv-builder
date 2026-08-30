/**
 * Generates favicon, PWA, Apple, and OG assets from brand/logo.svg.
 * Run: pnpm run generate:brand
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import toIco from "to-ico";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRAND = path.join(ROOT, "brand");
const APP = path.join(ROOT, "app");
const PUBLIC = path.join(ROOT, "public");

const BG = "#09090b";

async function pngFromLogo(
  size: number,
  opts: { padding?: number; background?: string } = {},
) {
  const padding = opts.padding ?? 0;
  const inner = size - padding * 2;
  const logo = await sharp(path.join(BRAND, "logo.svg"))
    .resize(inner, inner, { fit: "contain" })
    .png()
    .toBuffer();

  if (!opts.background) {
    return sharp(logo).resize(size, size).png().toBuffer();
  }

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: opts.background,
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(path.join(PUBLIC, "icons"), { recursive: true });

  const logoSvg = await readFile(path.join(BRAND, "logo.svg"));

  // Next.js file-based metadata (app/)
  await writeFile(path.join(APP, "icon.svg"), logoSvg);

  const sizes = [16, 32, 48] as const;
  const faviconPngs = await Promise.all(
    sizes.map((s) => pngFromLogo(s, { padding: 2, background: BG })),
  );
  const faviconIco = await toIco(faviconPngs);
  await writeFile(path.join(APP, "favicon.ico"), faviconIco);

  const apple = await pngFromLogo(180, { padding: 24, background: BG });
  await writeFile(path.join(APP, "apple-icon.png"), apple);

  const icon192 = await pngFromLogo(192, { padding: 28, background: BG });
  const icon512 = await pngFromLogo(512, { padding: 72, background: BG });
  const mask192 = await pngFromLogo(192, { padding: 48, background: BG });
  const mask512 = await pngFromLogo(512, { padding: 128, background: BG });

  await writeFile(path.join(PUBLIC, "icons", "icon-192.png"), icon192);
  await writeFile(path.join(PUBLIC, "icons", "icon-512.png"), icon512);
  await writeFile(path.join(PUBLIC, "icons", "icon-192-maskable.png"), mask192);
  await writeFile(path.join(PUBLIC, "icons", "icon-512-maskable.png"), mask512);

  const og = await sharp(path.join(BRAND, "og-template.svg"))
    .resize(1200, 630)
    .png()
    .toBuffer();
  await writeFile(path.join(APP, "opengraph-image.png"), og);
  await writeFile(path.join(APP, "twitter-image.png"), og);

  const manifest = {
    name: "CV Builder",
    short_name: "CV Builder",
    description:
      "Create, preview, and export a professional CV as PDF.",
    start_url: "/",
    display: "standalone",
    background_color: BG,
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  await writeFile(
    path.join(PUBLIC, "site.webmanifest"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  console.log("Brand assets written to app/ and public/icons/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
