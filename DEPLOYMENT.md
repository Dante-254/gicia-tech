Vercel Deployment & Cloudinary

Overview

- Frontend: Vite-built static site (dist) — deploy to Vercel as a static build.
- Backend: small Express server that currently runs in `server/index.js`.

Options for production deployment

1. Frontend on Vercel, Backend on a server platform (recommended)

   - Deploy the frontend to Vercel (automatic from GitHub). Set build command `npm run build` and output folder `dist`.
   - Deploy the backend to Railway/Render/Heroku/PlanetScale functions or a small VPS. This avoids refactoring the Express app into serverless functions.

2. Frontend + Backend on Vercel (serverless)
   - Vercel prefers separate serverless functions under `/api`. The current `server/index.js` is an Express app and can be adapted to serverless (requires refactor).
   - A quick (but not ideal) approach is to use the `@vercel/node` builder with `server/index.js` as an entry point (see `vercel.json`). Keep in mind you may need to refactor long-running or file-system dependent features (like `db.json` and local file storage) when moving to serverless.

Cloudinary (image hosting)

- Why: Cloudinary stores images, serves them via CDN, and gives secure public URLs you can embed in the frontend. It removes reliance on server local file storage.
- How it was integrated: the server's `/api/upload` route will forward uploaded files to Cloudinary when the `CLOUDINARY_*` env vars are set. The server will delete the local copy after upload and return the hosted `secure_url`.

Migration (upload existing images to Cloudinary)

- Locally, set the Cloudinary env vars and run the migration script from the `server/` folder:

  ```bash
  cd server
  export CLOUDINARY_CLOUD_NAME=your_cloud_name
  export CLOUDINARY_API_KEY=your_api_key
  export CLOUDINARY_API_SECRET=your_api_secret
  npm run migrate-cloudinary
  ```

  The script will:

  - upload any local `/public/project-images/*` files referenced in `server/db.json` to Cloudinary,
  - replace the `image` paths in `server/db.json` with the Cloudinary `secure_url`,
  - back up your original `db.json` to `db.json.bak`.

Important: After running migration, commit the updated `server/db.json` (which will now reference hosted image URLs) and push to your production backend host so the frontend can display images without relying on local file storage.

Important production notes

- Remove or rotate seeded dev credentials in `server/db.json` before going public.
- The server currently uses a local JSON file (`server/db.json`) as storage. For reliability and concurrency, migrate to a proper database (Postgres/MySQL/Supabase) before production.
- If you deploy backend as serverless functions, switch away from local filesystem usage for images and DB.

Quick deploy steps (frontend only)

1. Push your repo to GitHub.
2. Sign in to Vercel and import the repo.
3. Set the build command: `npm run build` and output directory: `dist`.
4. Add environment variables (Vite client vars must be prefixed with `VITE_` if you need them exposed to the browser).
5. Deploy.

**Checklist — Vercel (frontend) + Render (backend)**

- **Vercel (Frontend)**:

  - `VITE_API_BASE`: Set to your backend base URL (e.g. `https://your-backend.onrender.com`).
  - Any other `VITE_` prefixed runtime flags you need exposed to the browser.
  - Redeploy after adding/modifying environment variables.

- **Render (Backend)**:
  - `JWT_SECRET`: Strong secret for signing JWTs.
  - `FRONTEND_ORIGIN`: Your frontend origin (e.g. `https://your-site.vercel.app`). Can be a comma-separated list of allowed origins.
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using Cloudinary uploads).
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase in production).
  - Ensure `NODE_ENV=production` is set on the host for production behavior.
  - Do **not** commit secrets to the repo; set them in Render's environment settings.

Important: If `VITE_API_BASE` is not set on the frontend, the site will try to call `/api/*` on the frontend host which will result in failed requests and blank content. Set `VITE_API_BASE` to the backend URL and redeploy the frontend to resolve blank pages.

If you'd like, I can:

- Convert the backend to Vercel serverless functions (split endpoints into `/api/*` files).
- Migrate `db.json` to Supabase/Postgres and wire the app to it.
- Create a CI workflow and one-click Vercel setup.

**Next step suggestion:** Should I convert `/api/upload` and other endpoints into Vercel-compatible serverless functions, or deploy the backend to a separate service like Render?

Render deployment (recommended for backend)

- Render is a good choice for host­ing the Node/Express backend because it provides a persistent filesystem for now (though using Supabase for DB+storage is still preferred). To deploy to Render:

  1.  Create a new Web Service on Render and connect your GitHub repo.
  2.  Set the build and start commands: `npm install && npm run build` (if you build server assets) and `npm start` for runtime, or simply `npm start` if no build step is required.
  3.  Add the required environment variables in Render dashboard:
      - `JWT_SECRET` (strong secret)
      - `FRONTEND_ORIGIN` (your frontend origin)
      - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using Cloudinary)
      - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase)
      - `PORT` (Render provides a `$PORT` env; server uses `process.env.PORT || 4000`)
  4.  For persistence: if you rely on `server/db.json` in Render, use automated backups because the instance may be restarted. Better: migrate to Supabase so persistence is external and reliable.

Render will expose your backend at a public URL — set `VITE_API_BASE` in Vercel (or your frontend host) to that URL so the frontend talks to the correct API.

Summary: Use Render for the Express backend and Supabase for the DB/storage. This combination provides a stable, production-ready deployment model.
