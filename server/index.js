import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// FRONTEND_ORIGIN may be a comma-separated list of allowed origins.
// In non-production we allow any origin to simplify local development.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const _allowedOrigins = String(FRONTEND_ORIGIN)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
function corsOriginChecker(origin, callback) {
  // allow non-browser requests (curl, server-side) or same-origin
  if (!origin) return callback(null, true);
  // in development allow any origin
  if (process.env.NODE_ENV !== "production") return callback(null, true);
  // allow wildcard
  if (_allowedOrigins.includes("*")) return callback(null, true);
  if (_allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"), false);
}
app.use(cors({ origin: corsOriginChecker }));
app.use(helmet());
app.use(morgan(process.env.LOG_FORMAT || "combined"));

// Basic rate limiter to protect against brute-force and abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 120, // default 120 requests/min
});
app.use(limiter);
app.use(express.json({ limit: "10mb" }));

const DB_FILE = path.join(__dirname, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
if (JWT_SECRET === "change_this_secret") {
  console.warn(
    "Warning: Using default JWT_SECRET. For production, set a strong JWT_SECRET environment variable."
  );
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify({ superusers: [], projects: [] }, null, 2)
      );
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load DB:", err);
    return { superusers: [], projects: [] };
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Serve project images from the public folder
app.use(
  "/project-images",
  express.static(path.join(__dirname, "..", "public", "project-images"))
);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "project-images"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Configure Cloudinary if environment variables are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured: uploads will be forwarded to Cloudinary");
}

// Configure Supabase if service role key is present
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
    }
  );
  console.log(
    "Supabase configured: projects and users can be migrated/queried when enabled"
  );
}

// In production we require Supabase to be configured. Fail fast if missing.
if (process.env.NODE_ENV === "production" && !supabase) {
  console.error(
    "FATAL: NODE_ENV=production but Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

// Seed projects from images if empty
function seedProjectsIfEmpty() {
  const db = loadDB();
  if (db.projects && db.projects.length > 0) return;

  const projectsDir = path.join(__dirname, "..", "public", "project-images");
  if (!fs.existsSync(projectsDir)) {
    console.warn("projects dir not found, skipping seed");
    saveDB(db);
    return;
  }
  const files = fs
    .readdirSync(projectsDir)
    .filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));

  const projectNames = [
    "Modern Apartment Complex",
    "Office Tower",
    "Luxury Villas",
    "Shopping Mall",
    "Beach Resort",
    "Golf Course Estate",
    "Tech Park",
    "Hospital Complex",
    "School Campus",
    "Conference Center",
    "Warehouse Facility",
    "Residential Estate",
    "Business Center",
    "Sports Complex",
    "Retirement Village",
    "Eco Homes",
    "City Hotel",
    "Lakeview Apartments",
    "Mountain Retreat",
    "Urban Lofts",
  ];

  const descriptions = [
    "A luxury apartment complex with modern amenities.",
    "State-of-the-art office tower in the CBD.",
    "Exclusive villas with private gardens and pools.",
    "Modern shopping mall with entertainment facilities.",
    "Beautiful resort on the Kenyan coast.",
    "Premium estate with golf course views.",
    "A hub for technology companies and startups.",
    "State-of-the-art medical facilities.",
    "Modern school campus for all ages.",
    "Large conference and event center.",
    "Secure warehouse for logistics and storage.",
    "Family-friendly residential estate.",
    "Offices and meeting rooms for businesses.",
    "Facilities for multiple sports.",
    "Comfortable living for seniors.",
    "Sustainable eco-friendly homes.",
    "Luxury hotel in the city center.",
    "Apartments with stunning lake views.",
    "Peaceful retreat in the mountains.",
    "Trendy loft apartments in the city.",
  ];

  const statuses = ["Available", "Sold"];

  files.forEach((file, idx) => {
    const imageUrl = `../public/project-images/${file}`;
    const title = projectNames[idx % projectNames.length];
    const description = descriptions[idx % descriptions.length];
    const status = statuses[idx % statuses.length];
    db.projects.push({
      id:
        (db.projects.length ? db.projects[db.projects.length - 1].id + 1 : 1) +
        idx,
      title,
      description,
      status,
      image: imageUrl,
      created_by: "system",
      created_at: new Date().toISOString(),
    });
  });

  saveDB(db);
  console.log(`Seeded ${files.length} projects`);
}

// removed local seeding: use Supabase as the single source of truth
// seedProjectsIfEmpty();

// Auth middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Routes
app.get("/api/projects", async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("id", { ascending: false });
      if (error) {
        console.error("Supabase read error:", error);
        return res.status(500).json({ error: "Failed to read projects" });
      }
      return res.json(data || []);
    }

    // Development fallback to local JSON DB
    const db = loadDB();
    const projects = (db.projects || [])
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0));
    return res.json(projects);
  } catch (err) {
    console.error("Projects handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Expose config/feature flags to public clients
app.get("/api/config", (req, res) => {
  res.json({
    raptor_mini: process.env.RAPTOR_MINI === "true",
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/superusers", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  try {
    if (!supabase)
      return res.status(500).json({ error: "Supabase not configured" });
    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from("superusers")
      .insert([{ username, password_hash: hash }])
      .select();
    if (error) return res.status(400).json({ error: error.message || error });
    return res.json({ ok: true, user: data && data[0] });
  } catch (err) {
    console.error("Create superuser error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/superusers/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("superusers")
        .select("*")
        .eq("username", username)
        .limit(1)
        .single();
      if (error || !data)
        return res.status(401).json({ error: "Invalid credentials" });
      const ok = await bcrypt.compare(password, data.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign(
        { username: data.username, id: data.id },
        JWT_SECRET,
        { expiresIn: "8h" }
      );
      return res.json({ token, username: data.username });
    }

    // Local fallback for development
    const db = loadDB();
    const user = (db.superusers || []).find((s) => s.username === username);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { username: user.username, id: user.id },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );
    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/projects", authenticate, (req, res) => {
  (async () => {
    try {
      const { title, description, status, image } = req.body;
      if (!title) return res.status(400).json({ error: "Missing title" });

      if (supabase) {
        const row = {
          title,
          description: description || "",
          status: status || "Available",
          image: image || null,
          created_by: req.user.username,
          created_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from("projects")
          .insert([row])
          .select();
        if (error)
          return res.status(400).json({ error: error.message || error });
        return res.json({ ok: true, project: data && data[0] });
      }

      const db = loadDB();
      const id = db.projects.length
        ? db.projects[db.projects.length - 1].id + 1
        : 1;
      const project = {
        id,
        title,
        description: description || "",
        status: status || "Available",
        image: image || null,
        created_by: req.user.username,
        created_at: new Date().toISOString(),
      };
      db.projects.push(project);
      saveDB(db);
      res.json({ ok: true, project });
    } catch (err) {
      console.error("Create project error:", err);
      res.status(500).json({ error: "Server error" });
    }
  })();
});

// Accept image field name from the frontend (fd.append('image', file))
app.post("/api/upload", authenticate, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  // If Cloudinary is configured, upload the saved file and remove local copy
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const filePath = req.file.path;
    cloudinary.uploader
      .upload(filePath, { folder: "gicia-projects" })
      .then((result) => {
        try {
          // remove local file
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn("Failed to remove local upload:", err.message);
        }
        res.json({ url: result.secure_url, provider: "cloudinary" });
      })
      .catch((err) => {
        console.error("Cloudinary upload failed:", err);
        res.status(500).json({ error: "Upload failed" });
      });
    return;
  }

  const url = `/project-images/${req.file.filename}`;
  res.json({ url });
});

// Update a project (owner only)
app.put("/api/projects/:id", authenticate, (req, res) => {
  (async () => {
    try {
      const id = Number(req.params.id);
      const { title, description, status, image } = req.body;

      if (supabase) {
        const updates = {
          title,
          description,
          status,
          image,
          updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from("projects")
          .update(updates)
          .eq("id", id)
          .select();
        if (error)
          return res.status(400).json({ error: error.message || error });
        return res.json({ ok: true, project: data && data[0] });
      }

      const db = loadDB();
      const idx = (db.projects || []).findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      const project = db.projects[idx];
      project.title = title ?? project.title;
      project.description = description ?? project.description;
      project.status = status ?? project.status;
      project.image = image ?? project.image;
      project.updated_at = new Date().toISOString();
      db.projects[idx] = project;
      saveDB(db);
      res.json({ ok: true, project });
    } catch (err) {
      console.error("Update project error:", err);
      res.status(500).json({ error: "Server error" });
    }
  })();
});

// Delete a project (owner only)
app.delete("/api/projects/:id", authenticate, (req, res) => {
  (async () => {
    try {
      const id = Number(req.params.id);
      if (supabase) {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error)
          return res.status(400).json({ error: error.message || error });
        return res.json({ ok: true });
      }

      const db = loadDB();
      const idx = (db.projects || []).findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Not found" });
      db.projects.splice(idx, 1);
      saveDB(db);
      res.json({ ok: true });
    } catch (err) {
      console.error("Delete project error:", err);
      res.status(500).json({ error: "Server error" });
    }
  })();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
