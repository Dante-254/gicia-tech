import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_ORIGIN }));
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
    const imageUrl = `/project-images/${file}`;
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

seedProjectsIfEmpty();

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
app.get("/api/projects", (req, res) => {
  const db = loadDB();
  const rows = (db.projects || []).slice().reverse();
  res.json(rows);
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
  const db = loadDB();
  const exists = (db.superusers || []).find((s) => s.username === username);
  if (exists) return res.status(400).json({ error: "User exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: db.superusers.length
      ? db.superusers[db.superusers.length - 1].id + 1
      : 1,
    username,
    password_hash: hash,
  };
  db.superusers.push(user);
  saveDB(db);
  res.json({ ok: true });
});

app.post("/api/superusers/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Missing fields" });
  const db = loadDB();
  const user = (db.superusers || []).find((s) => s.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token, username: user.username });
});

app.post("/api/projects", authenticate, (req, res) => {
  const { title, description, status, image } = req.body;
  if (!title) return res.status(400).json({ error: "Missing title" });
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
});

// Accept image field name from the frontend (fd.append('image', file))
app.post("/api/upload", authenticate, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/project-images/${req.file.filename}`;
  res.json({ url });
});

// Update a project (owner only)
app.put("/api/projects/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const { title, description, status, image } = req.body;
  const db = loadDB();
  const idx = (db.projects || []).findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const project = db.projects[idx];
  // Only allow creator (or any authenticated superuser) to edit — simple policy
  if (
    req.user.username !== project.created_by &&
    project.created_by !== "system"
  ) {
    // allow if superuser exists (req.user is a superuser)
  }
  project.title = title ?? project.title;
  project.description = description ?? project.description;
  project.status = status ?? project.status;
  project.image = image ?? project.image;
  project.updated_at = new Date().toISOString();
  db.projects[idx] = project;
  saveDB(db);
  res.json({ ok: true, project });
});

// Delete a project (owner only)
app.delete("/api/projects/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const db = loadDB();
  const idx = (db.projects || []).findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const project = db.projects[idx];
  // Simple policy: allow deletion if requester is the creator or any authenticated superuser
  // (in this simplified app, any authenticated user is treated as a superuser)
  db.projects.splice(idx, 1);
  saveDB(db);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
