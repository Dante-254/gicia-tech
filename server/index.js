import "dotenv/config";
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

// ─── App ────────────────────────────────────────────────────────────────────
const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const _allowedOrigins = String(FRONTEND_ORIGIN)
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

function corsOriginChecker(origin, callback) {
  if (!origin) return callback(null, true);
  if (process.env.NODE_ENV !== "production") return callback(null, true);
  if (_allowedOrigins.includes("*")) return callback(null, true);
  const normalizedOrigin = origin.replace(/\/+$/, "");
  if (_allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
  console.warn(
    `CORS blocked: ${origin} | allowed: ${_allowedOrigins.join(", ")}`,
  );
  return callback(new Error("Not allowed by CORS"), false);
}

app.use(cors({ origin: corsOriginChecker }));
app.use(helmet());
app.use(morgan(process.env.LOG_FORMAT || "combined"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 120,
  }),
);
app.use(express.json({ limit: "10mb" }));

// ─── JWT ────────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
if (JWT_SECRET === "change_this_secret") {
  console.warn(
    "⚠️  Using default JWT_SECRET — set a strong secret in production.",
  );
}

// ─── Cloudinary ─────────────────────────────────────────────────────────────
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured");
}

/**
 * Extract the Cloudinary public_id from a hosted URL.
 * e.g. https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg → folder/file
 */
function extractCloudinaryPublicId(url) {
  if (!url || !url.includes("cloudinary.com")) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

async function deleteCloudinaryImage(imageUrl) {
  if (!cloudinaryConfigured || !imageUrl) return;
  const publicId = extractCloudinaryPublicId(imageUrl);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Cloudinary image deleted: ${publicId}`);
  } catch (err) {
    console.warn("Cloudinary delete warning:", err.message);
  }
}

// ─── Multer (temp disk storage before Cloudinary upload) ────────────────────
const uploadDir = path.join(__dirname, "..", "public", "project-images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve locally stored images (fallback when Cloudinary is not configured)
app.use(
  "/project-images",
  express.static(path.join(__dirname, "..", "public", "project-images")),
);

// ─── Supabase ───────────────────────────────────────────────────────────────
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.",
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
console.log("✅ Supabase configured");

// ─── Auth middleware ─────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Feature flags / config
app.get("/api/config", (_req, res) => {
  res.json({
    raptor_mini: process.env.RAPTOR_MINI === "true",
    env: process.env.NODE_ENV || "development",
  });
});

// List all projects
app.get("/api/projects", async (_req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: false });
  if (error) return res.status(500).json({ error: "Failed to load projects" });
  res.json(data || []);
});

// Create a project (owner only)
app.post("/api/projects", authenticate, async (req, res) => {
  const { title, description, status, image } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        title,
        description: description || "",
        status: status || "Available",
        image: image || null,
        created_by: req.user.username,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true, project: data[0] });
});

// Update a project (owner only)
app.put("/api/projects/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, status, image } = req.body;

  const { data, error } = await supabase
    .from("projects")
    .update({
      title,
      description,
      status,
      image,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true, project: data[0] });
});

// Delete a project + its Cloudinary image (owner only)
app.delete("/api/projects/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);

  // Fetch image URL before deleting
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("image")
    .eq("id", id)
    .single();

  if (fetchError) return res.status(404).json({ error: "Project not found" });

  // Delete from database
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return res.status(400).json({ error: error.message });

  // Delete image from Cloudinary (non-blocking — don't fail if this errors)
  await deleteCloudinaryImage(project?.image);

  res.json({ ok: true });
});

// Upload image → Cloudinary
app.post(
  "/api/upload",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    if (cloudinaryConfigured) {
      const filePath = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "gicia-projects",
        });
        fs.unlink(filePath, () => {}); // clean up temp file
        return res.json({ url: result.secure_url, provider: "cloudinary" });
      } catch (err) {
        fs.unlink(filePath, () => {});
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Fallback: serve from local disk (dev only)
    res.json({
      url: `/project-images/${req.file.filename}`,
      provider: "local",
    });
  },
);

// Create superuser (protected — call from server CLI or one-time setup only)
app.post("/api/superusers", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("superusers")
    .insert([{ username, password_hash: hash }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true, user: data[0] });
});

// Superuser login
app.post("/api/superusers/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });

  const { data: user, error } = await supabase
    .from("superusers")
    .select("*")
    .eq("username", username)
    .limit(1)
    .single();

  if (error || !user)
    return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token, username: user.username });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
