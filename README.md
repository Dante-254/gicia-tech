# Gicia Technologies Website

This is a React-based website for Gicia Technologies.

## Getting Started

### Prerequisites

- Node.js (v16 or newer recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dante-254/gicia-tech.git
   cd gicia-tech
   ```
2. Install dependencies:
   Open a terminal in the project folder and run:
   ```bash
   npm install
   ```

### Running the App (Development Mode)

Start the app locally:

```bash
npm start
```

This will open the app in your browser at [http://localhost:3000](http://localhost:3000).

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The build output will be in the `build` directory.

### Previewing the Production Build

To preview the production build locally:

```bash
npm install -g serve
serve -s build
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

---

For any issues, please contact the project maintainer.

# Gicia Technologies

## Setup Instructions

### 1. MySQL Database

- Create the database and tables:
  ```sql
  CREATE DATABASE IF NOT EXISTS giciaccl;
  USE giciaccl;
  CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Available', 'Sold') NOT NULL DEFAULT 'Available',
    image TEXT
  );
  CREATE TABLE IF NOT EXISTS superusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  );
  ```
- Seed initial projects:
  ```sh
  mysql -u manoti -p giciaccl < server/seed-projects.sql
  ```

### 2. MySQL User Setup

- Ensure user `manoti` exists and has privileges:
  ```sql
  ALTER USER 'manoti'@'localhost' IDENTIFIED BY 'your_actual_password';
  GRANT ALL PRIVILEGES ON giciaccl.* TO 'manoti'@'localhost';
  FLUSH PRIVILEGES;
  ```
- Update `/server/index.js` with:
  ```js
  const db = await mysql.createPool({
    host: "localhost",
    user: "manoti",
    password: "your_actual_password",
    database: "giciaccl",
  });
  ```

### 3. Backend Setup

- Install dependencies:
  ```sh
  cd server
  npm install
  ```
- Start backend:
  ```sh
  npm start
  ```
- Backend runs on `http://localhost:4000`

### 4. Frontend Setup

- Start frontend (Vite/React):
  ```sh
  npm install
  npm run dev
  ```
- Frontend fetches projects from `http://localhost:4000/api/projects`

### 5. Troubleshooting

- If you see `Access denied for user 'manoti'@'localhost'`, check your MySQL password and privileges.
- If projects are not visible, ensure backend is running and database is seeded.
- For CORS/network issues, check browser console and backend logs.

---

## Features

- Customers can view all projects without logging in.
- Only authenticated superusers can add/edit projects.
- Superusers can register and log in from the Projects page.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
