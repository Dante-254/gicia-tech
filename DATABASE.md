# JKBG Construction - Database & Backend Access Guide

## Overview

This application uses a **JSON-based database** stored in `server/db.json` for simplicity and portability. The backend is built with **Node.js + Express**.

---

## Database Structure

The `server/db.json` file contains:

```json
{
  "projects": [
    {
      "id": 210,
      "title": "Urban Lofts",
      "description": "Trendy loft apartments in the city.",
      "status": "Sold",
      "image": "/project-images/WhatsApp Image 2025-11-07 at 19.30.54.jpeg",
      "created_by": "system",
      "created_at": "2025-11-17T09:21:09.506Z"
    }
    // ... more projects
  ],
  "superusers": [
    {
      "id": 1,
      "username": "owner",
      "password": "$2b$10$..." // bcrypted password
    }
  ]
}
```

---

## Backend API Endpoints

### Base URL

```
http://localhost:4000
```

### Projects

- **GET** `/api/projects` - Fetch all projects
- **POST** `/api/projects` - Create new project (requires JWT token)
- **PUT** `/api/projects/:id` - Update project (requires JWT token)
- **DELETE** `/api/projects/:id` - Delete project (requires JWT token)

### Authentication

- **POST** `/api/superusers/login` - Login with username/password
  - Request: `{ username: string, password: string }`
  - Response: `{ token: string, username: string }`

### File Upload

- **POST** `/api/upload` - Upload project image
  - Form data: `image` (file)
  - Response: `{ url: string }`

---

## After Release: Accessing the Database

### Option 1: Direct File Edit (Recommended for Manual Changes)

1. Navigate to: `server/db.json`
2. Edit the JSON directly (backup first!)
3. Restart the backend: `npm run dev` in the `/server` directory

### Option 2: Using the Admin Panel (If You Have Owner Access)

1. Click **"Owner"** button in the navbar
2. Login with credentials:
   - Username: `owner`
   - Password: `jkbgowner2025`
3. Create, edit, or delete projects directly through the UI
4. Changes are automatically saved to `db.json`

### Option 3: API Calls (For Developers)

Use tools like **Postman** or **cURL** to interact with the API:

**Example: Get All Projects**

```bash
curl http://localhost:4000/api/projects
```

**Example: Login**

```bash
curl -X POST http://localhost:4000/api/superusers/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"jkbgowner2025"}'
```

**Example: Create Project (with JWT token)**

```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "title":"New Project",
    "description":"...",
    "status":"Available",
    "image":"/project-images/image.jpg"
  }'
```

---

## Changing Owner Password (Admin Task)

1. **Edit `server/db.json`** manually
2. Generate a new bcrypted password using Node.js:
   ```javascript
   const bcrypt = require("bcryptjs");
   bcrypt.hash("newPassword", 10, (err, hash) => {
     console.log(hash); // Use this hash in db.json
   });
   ```
3. Replace the `password` field in the superuser object
4. Restart the backend server

Alternatively, use the command line:

```bash
cd server
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('newPassword', 10, (err, hash) => console.log(hash));"
```

---

## Deployment Considerations

### Before Going Live:

1. **Change the default owner password**

   - Current: `jkbgowner2025`
   - Use a strong, unique password

2. **Set up automated backups** for `server/db.json`

   - Back up daily to cloud storage (AWS S3, Google Drive, etc.)
   - Maintain at least 7-day backup history

3. **Use environment variables** for sensitive data:

   - Store backend URLs in `.env` files
   - Never commit `.env` to version control

4. **Enable HTTPS** in production

   - Secure all API calls with SSL/TLS
   - Use a certificate from Let's Encrypt (free)

5. **Implement rate limiting**

   - Prevent abuse of API endpoints
   - Install: `npm install express-rate-limit`

6. **Consider upgrading to a real database**

### Feature flags and environment variables

- Set `JWT_SECRET` (server) to a secure value before production.
- Set `FRONTEND_ORIGIN` to the production front-end URL to restrict CORS.
- Use `RAPTOR_MINI` or `VITE_RAPTOR_MINI` (true/false) to enable/disable preview features across clients. This repo exposes a server endpoint `/api/config` that returns flags (e.g., `raptor_mini`).
- Example `.env` variables:

```
JWT_SECRET=super_secret_value
PORT=4000
FRONTEND_ORIGIN=https://www.example.com
RAPTOR_MINI=false
```

- For larger deployments, use MongoDB, PostgreSQL, or MySQL
- Provides better scalability and security

### Using MongoDB Atlas + Cloudinary (Recommended)

1. Create a MongoDB Atlas free-tier cluster and obtain the connection string (MONGO_URI). Example:
  `mongodb+srv://<user>:<pw>@cluster0.mongodb.net/databasename?retryWrites=true&w=majority`
2. Create a Cloudinary account and get your `CLOUDINARY_URL` (like `cloudinary://api_key:api_secret@cloud_name`).
3. Set environment variables on your production host:
  ```bash
  MONGO_URI="<your mongodb uri>"
  CLOUDINARY_URL="cloudinary://<api>:<secret>@<name>"
  JWT_SECRET="super-secret-value"
  FRONTEND_ORIGIN="https://your-frontend-url"
  ```
4. With these set, the backend will use MongoDB for projects and upload images to Cloudinary (if configured).

---

## Troubleshooting

### Backend won't start

- Check if port 4000 is already in use:
  ```bash
  lsof -i :4000
  kill -9 <PID>
  ```
- Check `server/db.json` for syntax errors (must be valid JSON)

### Project images not showing

- Verify image files exist in `public/project-images/`
- Check that image paths in `db.json` match actual filenames
- Ensure filenames don't have spaces or use URL encoding

### Login fails

- Verify credentials in `server/db.json`
- Check that the password is properly bcrypted
- Restart the backend after making changes

---

## Quick Start (Development)

```bash
# Terminal 1 - Backend
cd server
npm install
node index.js

# Terminal 2 - Frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Questions?

For support or detailed documentation, contact the development team.
