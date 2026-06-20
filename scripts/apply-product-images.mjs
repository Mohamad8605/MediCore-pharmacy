/**
 * Sets product image_url in Supabase for all medications.
 *
 * Run with: node scripts/apply-product-images.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

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

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const productImages = [
  { name: "Paracetamol 500mg", image_url: "/images/paracetamol-500mg.webp" },
  { name: "Ibuprofen 400mg", image_url: "/images/ibuprofen-400mg.webp" },
  { name: "Naproxen 250mg", image_url: "/images/naproxen-250mg.webp" },
  { name: "Aspirin 500mg", image_url: "/images/aspirin-500mg.jpg" },
  { name: "Panadol 665mg", image_url: "/images/panadol-665mg.avif" },
  { name: "Diclofenac Gel 1%", image_url: "/images/diclofenac-gel-1.webp" },
  { name: "Salbutamol Inhaler", image_url: "/images/salbutamol-inhaler.jpg" },
  { name: "Cough Syrup 200ml", image_url: "/images/cough-syrup-200ml.jpg" },
  { name: "Cold & Flu Tablets", image_url: "/images/cold-flu-tablets.webp" },
  { name: "Nasal Spray Xylometazoline", image_url: "/images/nasal-spray-xylometazoline.webp" },
  { name: "Echinacea Drops", image_url: "/images/echinacea-drops.webp" },
  { name: "Omeprazole 20mg", image_url: "/images/omeprazole-20mg.webp" },
  { name: "Multivitamin Adults", image_url: "/images/multivitamin-adults.jpg" },
  { name: "Vitamin D3 1000 IU", image_url: "/images/vitamin-d3-1000-iu.webp" },
  { name: "Insulin Glargine", image_url: "/images/insulin-glargine.jpg" },
  { name: "Baby Paracetamol 125mg", image_url: "/images/baby-paracetamol-125mg.webp" },
  { name: "Nappy Rash Cream", image_url: "/images/nappy-rash-cream.jpg" },
  { name: "Baby Multivitamin Drops", image_url: "/images/baby-multivitamin-drops.webp" },
  { name: "Pregnancy Multivitamin", image_url: "/images/pregnancy-multivitamin.webp" },
  { name: "Hand Sanitizer 250ml", image_url: "/images/hand-sanitizer-250ml.jpg" },
  { name: "Amoxicillin 500mg", image_url: "/images/amoxicillin-500mg.jpeg" },
  { name: "Cetirizine 10mg", image_url: "/images/cetirizine-10mg.avif" },
  { name: "Loratadine 10mg", image_url: "/images/loratadine-10mg.webp" },
  { name: "Wound Healing Ointment", image_url: "/images/wound-healing-ointment.webp" },
  { name: "Hydrocortisone Cream 1%", image_url: "/images/hydrocortisone-cream-1.webp" },
  { name: "Burn Relief Gel", image_url: "/images/burn-relief-gel.jpg" },
  { name: "Zinc Oxide Ointment", image_url: "/images/zinc-oxide-ointment.jpg" },
];

async function main() {
  console.log("Applying product images...\n");

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const { name, image_url } of productImages) {
    const { data: existing, error: fetchErr } = await supabase
      .from("medications")
      .select("id, image_url")
      .eq("name", name)
      .maybeSingle();

    if (fetchErr) {
      console.error(`  ❌ Error fetching "${name}": ${fetchErr.message}`);
      errors++;
      continue;
    }

    if (!existing) {
      console.log(`  ⚠️  "${name}" not found in database`);
      skipped++;
      continue;
    }

    if (existing.image_url === image_url) {
      console.log(`  ✓ "${name}" — already set`);
      skipped++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from("medications")
      .update({ image_url })
      .eq("id", existing.id);

    if (updateErr) {
      console.error(`  ❌ Error updating "${name}": ${updateErr.message}`);
      errors++;
    } else {
      console.log(`  ✓ "${name}" → ${image_url}`);
      updated++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Already set / skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

main().catch(console.error);
