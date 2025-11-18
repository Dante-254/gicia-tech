import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const DB_FILE = path.join(process.cwd(), "db.json");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment"
  );
  process.exit(2);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

if (!fs.existsSync(DB_FILE)) {
  console.error("db.json not found in server/ — nothing to migrate");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const projects = db.projects || [];
const superusers = db.superusers || [];

async function migrate() {
  console.log(
    `Migrating ${projects.length} projects and ${superusers.length} superusers to Supabase...`
  );

  // Migrate projects
  for (const p of projects) {
    const row = {
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      image: p.image,
      created_by: p.created_by || null,
      created_at: p.created_at || new Date().toISOString(),
    };
    const { error } = await supabase
      .from("projects")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("Failed to migrate project", p.id, error.message || error);
      console.error(
        "Make sure the `projects` table exists with columns: id (int), title (text), description (text), status (text), image (text), created_by (text), created_at (timestamp)"
      );
      process.exit(3);
    }
  }

  // Migrate superusers
  for (const u of superusers) {
    const row = {
      id: u.id,
      username: u.username,
      password_hash: u.password_hash || u.password || null,
    };
    const { error } = await supabase
      .from("superusers")
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error(
        "Failed to migrate superuser",
        u.username,
        error.message || error
      );
      console.error(
        "Make sure the `superusers` table exists with columns: id (int), username (text), password_hash (text)"
      );
      process.exit(4);
    }
  }

  console.log("Migration complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message || err);
  process.exit(5);
});
