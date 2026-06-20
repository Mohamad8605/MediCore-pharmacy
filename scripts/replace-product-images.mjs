/**
 * Copies new product photos to public/images/, removes old SVGs,
 * and updates image_url in Supabase.
 *
 * Run with: node scripts/replace-product-images.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, copyFileSync, unlinkSync, readdirSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const photosDir = "C:\\Users\\abood\\Documents\\GitHub\\MediCore\\photos";
const imagesDir = resolve(rootDir, "public", "images");

// Load .env
const envPath = resolve(rootDir, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed
          .slice(eqIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map source photo filenames → DB medication name → target slug
const photoMap = [
  { file: "Paracetamol 500mg.webp", name: "Paracetamol 500mg" },
  { file: "Ibuprofen 400mg.webp", name: "Ibuprofen 400mg" },
  { file: "Naproxen 250mg.webp", name: "Naproxen 250mg" },
  { file: "aspirin-500mg-x-10-tablets-uk-2.jpg", name: "Aspirin 500mg" },
  { file: "Panadol 665mg.avif", name: "Panadol 665mg" },
  { file: "Diclofenac Gel 1%.webp", name: "Diclofenac Gel 1%" },
  { file: "Salbutamol Inhaler.jpg", name: "Salbutamol Inhaler" },
  { file: "Cough Syrup 200ml.jpg", name: "Cough Syrup 200ml" },
  { file: "Cold & Flu Tablets.webp", name: "Cold & Flu Tablets" },
  { file: "Nasal Spray Xylometazoline.webp", name: "Nasal Spray Xylometazoline" },
  { file: "Echinacea Drops.webp", name: "Echinacea Drops" },
  { file: "Omeprazole 20mg.webp", name: "Omeprazole 20mg" },
  { file: "Multivitamin Adults.jpg", name: "Multivitamin Adults" },
  { file: "Vitamin D3 1000 IU.webp", name: "Vitamin D3 1000 IU" },
  { file: "Insulin Glargine.jpg", name: "Insulin Glargine" },
  { file: "Baby Paracetamol 125mg.webp", name: "Baby Paracetamol 125mg" },
  { file: "Nappy Rash Cream.jpg", name: "Nappy Rash Cream" },
  { file: "Baby Multivitamin Drops.webp", name: "Baby Multivitamin Drops" },
  { file: "Pregnancy Multivitamin.webp", name: "Pregnancy Multivitamin" },
  { file: "Hand Sanitizer 250ml.jpg", name: "Hand Sanitizer 250ml" },
  { file: "Amoxicillin 500mg.jpeg", name: "Amoxicillin 500mg" },
  { file: "Cetirizine 10mg.avif", name: "Cetirizine 10mg" },
  { file: "Loratadine 10mg.webp", name: "Loratadine 10mg" },
  { file: "Wound Healing Ointment.webp", name: "Wound Healing Ointment" },
  { file: "Hydrocortisone Cream 1%.webp", name: "Hydrocortisone Cream 1%" },
  { file: "Burn Relief Gel.jpg", name: "Burn Relief Gel" },
  { file: "Zinc Oxide Ointment.jpg", name: "Zinc Oxide Ointment" },
];

// Build target filename: slug(name) + extension
for (const item of photoMap) {
  const ext = extname(item.file);
  item.targetFile = `${slugify(item.name)}${ext}`;
  item.targetPath = join(imagesDir, item.targetFile);
  item.imageUrl = `/images/${item.targetFile}`;
  item.sourcePath = join(photosDir, item.file);
}

async function main() {
  // 1. Copy new photos
  console.log("Copying photos to public/images/...\n");
  let copied = 0;
  for (const item of photoMap) {
    if (!existsSync(item.sourcePath)) {
      console.log(`  ⚠️  Source not found: ${item.file}`);
      continue;
    }
    copyFileSync(item.sourcePath, item.targetPath);
    console.log(`  ✓ ${item.file} → ${item.targetFile}`);
    copied++;
  }
  console.log(`\nCopied ${copied} photos\n`);

  // 2. Remove old SVGs
  console.log("Removing old SVG files...\n");
  const oldSvgs = readdirSync(imagesDir).filter((f) => f.endsWith(".svg"));
  let removed = 0;
  for (const svg of oldSvgs) {
    unlinkSync(join(imagesDir, svg));
    console.log(`  ✗ Removed: ${svg}`);
    removed++;
  }
  console.log(`\nRemoved ${removed} SVGs\n`);

  // 3. Update Supabase
  console.log("Updating image_url in Supabase...\n");
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.log("⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Skipping DB update.");
    console.log("   The images are in public/images/ — update image_url manually.");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let updated = 0;
  let errors = 0;

  for (const item of photoMap) {
    const { data: existing, error: fetchErr } = await supabase
      .from("medications")
      .select("id, image_url")
      .eq("name", item.name)
      .maybeSingle();

    if (fetchErr) {
      console.error(`  ❌ Error fetching "${item.name}": ${fetchErr.message}`);
      errors++;
      continue;
    }

    if (!existing) {
      console.log(`  ⚠️  Medication "${item.name}" not found in database`);
      continue;
    }

    const { error: updateErr } = await supabase
      .from("medications")
      .update({ image_url: item.imageUrl })
      .eq("id", existing.id);

    if (updateErr) {
      console.error(`  ❌ Error updating "${item.name}": ${updateErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ "${item.name}" → ${item.imageUrl}`);
      updated++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Photos copied: ${copied}`);
  console.log(`  SVGs removed: ${removed}`);
  console.log(`  DB updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
}

main().catch(console.error);
