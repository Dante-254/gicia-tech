// server/migrate_all_to_cloudinary_and_supabase.mjs
import fs from "fs";
import path from "path";
import os from "os";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// prefer server/.env if present, otherwise fallback to process.env
const projectRoot = process.cwd();
const serverEnv = path.join(projectRoot, "server", ".env");
if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
} else {
  dotenv.config(); // loads process.cwd()/.env if exists
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(projectRoot, "server", "db.json");
if (!fs.existsSync(DB_FILE)) {
  console.error("db.json not found at server/db.json — nothing to migrate");
  process.exit(1);
}

// Required env vars
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  SUPABASE_BUCKET, // optional if you want to specifically handle supabase storage paths (not required)
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Missing Cloudinary credentials in environment.");
  process.exit(2);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
} else {
  console.warn(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — skipping DB upsert to Supabase (only local db.json will be updated)."
  );
}

function tmpFilePath(originalName = "img") {
  const rnd = crypto.randomBytes(6).toString("hex");
  const ext = path.extname(originalName) || ".tmp";
  return path.join(os.tmpdir(), `${Date.now()}-${rnd}${ext}`);
}

async function downloadToTmp(urlOrPath) {
  // remote URL (http/https)
  if (/^https?:\/\//i.test(urlOrPath)) {
    try {
      const res = await fetch(urlOrPath);
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tmp = tmpFilePath(path.basename(new URL(urlOrPath).pathname));
      fs.writeFileSync(tmp, buffer);
      return tmp;
    } catch (err) {
      throw new Error(`Failed to download ${urlOrPath}: ${err.message}`);
    }
  }

  // local path (e.g. /project-images/foo.jpg or project-images/foo.jpg)
  // Resolve relative to server/../public/<image>
  const candidate = path.join(projectRoot, "public", urlOrPath.replace(/^\/+/, ""));
  if (fs.existsSync(candidate)) return candidate;

  // if inside server/public maybe?
  const candidate2 = path.join(projectRoot, "server", "..", "public", urlOrPath.replace(/^\/+/, ""));
  if (fs.existsSync(candidate2)) return candidate2;

  // lastly check server/<urlOrPath>
  const candidate3 = path.join(projectRoot, "server", urlOrPath.replace(/^\/+/, ""));
  if (fs.existsSync(candidate3)) return candidate3;

  throw new Error(`Local file not found for ${urlOrPath}. Checked: ${candidate}, ${candidate2}, ${candidate3}`);
}

async function uploadToCloudinary(localFilePath, public_id_base = "giciaa-projects") {
  try {
    const res = await cloudinary.uploader.upload(localFilePath, {
      folder: public_id_base,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });
    return res;
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message || err}`);
  }
}

(async () => {
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  const projects = db.projects || [];
  const superusers = db.superusers || [];

  console.log(`Found ${projects.length} projects and ${superusers.length} superusers in ${DB_FILE}`);

  let uploadedCount = 0;
  const errors = [];

  for (const p of projects) {
    try {
      if (!p.image) {
        console.log(`Project ${p.id || "(no id)"}: no image field — skipping`);
        continue;
      }

      console.log(`Processing project ${p.id || "(no id)"} image: ${p.image}`);

      let tmpPath;
      try {
        tmpPath = await downloadToTmp(p.image);
      } catch (err) {
        console.warn(`  Could not obtain image for project ${p.id}: ${err.message}`);
        errors.push({ id: p.id, error: err.message });
        continue;
      }

      try {
        const result = await uploadToCloudinary(tmpPath, "jkbg-projects");
        if (result && result.secure_url) {
          console.log(`  Uploaded → ${result.secure_url}`);
          p.image = result.secure_url;
          uploadedCount += 1;
        } else {
          console.warn(`  Upload returned no secure_url for project ${p.id}`);
          errors.push({ id: p.id, error: "no secure_url returned" });
        }
      } catch (err) {
        console.warn(`  Cloudinary upload failed for project ${p.id}: ${err.message}`);
        errors.push({ id: p.id, error: err.message });
      } finally {
        // delete tmp file if it was saved into the tmp dir (not if it was directly the local public file)
        try {
          const tempDir = os.tmpdir();
          if (tmpPath && tmpPath.startsWith(tempDir) && fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
          }
        } catch (e) {
          // ignore cleanup errors
        }
      }
    } catch (err) {
      console.error(`Unexpected error processing project ${p.id}:`, err);
      errors.push({ id: p.id, error: String(err) });
    }
  }

  // Update db.json backup then write
  const bak = `${DB_FILE}.bak.${Date.now()}`;
  fs.copyFileSync(DB_FILE, bak);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  console.log(`Wrote updated ${DB_FILE}; backup saved to ${bak}`);
  console.log(`Uploaded ${uploadedCount} images to Cloudinary. ${errors.length} errors logged.`);

  // If supabase client available, upsert rows
  if (supabase) {
    console.log("Upserting updated rows to Supabase...");

    // Upsert projects in batches (100 at a time)
    try {
      const batchSize = 100;
      for (let i = 0; i < projects.length; i += batchSize) {
        const chunk = projects.slice(i, i + batchSize).map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          status: p.status,
          image: p.image,
          created_by: p.created_by || null,
          created_at: p.created_at || new Date().toISOString(),
        }));
        const { error } = await supabase.from("projects").upsert(chunk, { onConflict: "id" });
        if (error) {
          console.error("Supabase upsert error for projects:", error.message || error);
          throw error;
        }
        console.log(`  Upserted projects ${i + 1}-${Math.min(i + batchSize, projects.length)}`);
      }
    } catch (err) {
      console.error("Failed to upsert projects to Supabase:", err.message || err);
    }

    // Upsert superusers
    try {
      const suRows = superusers.map((u) => ({
        id: u.id,
        username: u.username,
        password_hash: u.password_hash || u.password || null,
      }));
      if (suRows.length) {
        const { error } = await supabase.from("superusers").upsert(suRows, { onConflict: "id" });
        if (error) {
          console.error("Supabase upsert error for superusers:", error.message || error);
        } else {
          console.log(`  Upserted ${suRows.length} superusers`);
        }
      }
    } catch (err) {
      console.error("Failed to upsert superusers:", err.message || err);
    }
  }

  // Final summary
  console.log("Migration finished.");
  console.log(`Images uploaded: ${uploadedCount}`);
  if (errors.length) {
    console.log("Some items had errors; first few:");
    console.log(errors.slice(0, 10));
  }
})();
