import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env from server/ if present
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  env.split(/\n/).forEach((line) => {
    const m = line.match(/^(\w+)=(.*)$/);
    if (m) {
      const k = m[1];
      let v = m[2];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      process.env[k] = v;
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in environment"
  );
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

(async () => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Supabase query error:", error);
      process.exit(3);
    }
    console.log("Projects count:", (data && data.length) || 0);
    if (data && data.length) {
      console.log("Sample project:", data[0]);
    }

    const { data: users, error: uerr } = await supabase
      .from("superusers")
      .select("id,username")
      .limit(10);
    if (uerr) {
      console.error("Supabase superusers query error:", uerr);
    } else {
      console.log("Superusers count:", (users && users.length) || 0);
      if (users && users.length) console.log("Sample user:", users[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error("Unexpected error querying Supabase:", err);
    process.exit(4);
  }
})();
