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
- Environment variables to set on Vercel (or your host):
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `JWT_SECRET` (set a strong secret)
  - `FRONTEND_ORIGIN` (e.g., `https://your-site.vercel.app`)
  - `RAPTOR_MINI` / `VITE_RAPTOR_MINI` (feature flags)

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

If you'd like, I can:

- Convert the backend to Vercel serverless functions (split endpoints into `/api/*` files).
- Migrate `db.json` to Supabase/Postgres and wire the app to it.
- Create a CI workflow and one-click Vercel setup.

**Next step suggestion:** Should I convert `/api/upload` and other endpoints into Vercel-compatible serverless functions, or deploy the backend to a separate service like Render?
