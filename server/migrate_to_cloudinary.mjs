import fs from "fs";
import path from "path";
import 'dotenv/config';
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from process.env — when running locally, use a .env loader if desired
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "CLOUDINARY_* env vars are not set. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET and try again."
  );
  process.exit(2);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DB_FILE = path.join(__dirname, "db.json");
if (!fs.existsSync(DB_FILE)) {
  console.error("db.json not found in server/ — nothing to migrate");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const projects = db.projects || [];
let uploaded = 0;

for (const p of projects) {
  try {
    if (!p.image) continue;
    const isRemote = String(p.image).startsWith("http");
    if (isRemote) continue; // already hosted

    // image path like /project-images/filename.jpg
    const imgPath = path.join(
      __dirname,
      "..",
      "public",
      p.image.replace(/^\/+/, "")
    );
    if (!fs.existsSync(imgPath)) {
      console.warn(`File not found: ${imgPath} — skipping`);
      continue;
    }

    console.log(`Uploading ${imgPath} to Cloudinary...`);
    // await upload
    // eslint-disable-next-line no-await-in-loop
    const result = await cloudinary.uploader.upload(imgPath, {
      folder: "giciaa-projects",
    });
    if (result && result.secure_url) {
      p.image = result.secure_url;
      uploaded += 1;
      console.log(`Uploaded: ${result.secure_url}`);
      // optionally remove local file
      try {
        fs.unlinkSync(imgPath);
      } catch (err) {
        console.warn(`Failed to remove local file ${imgPath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Failed to upload for project ${p.id}:`, err.message || err);
  }
}

// backup and write
fs.copyFileSync(DB_FILE, `${DB_FILE}.bak`);
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log(
  `Migration complete. Uploaded ${uploaded} images. Original db saved to db.json.bak`
);
