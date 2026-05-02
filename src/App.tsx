import { useState, useEffect } from "react";
import {
  Lock,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Mail,
  MessageCircle,
} from "lucide-react";

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

function App() {
  const [view, setView] = useState<"home" | "about" | "projects">("home");
  const [loggedInUser, setLoggedInUser] = useState<string>(
    localStorage.getItem("gicia_user") || "",
  );
  const [showLogin, setShowLogin] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("gicia_darkmode") === "true";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [config, setConfig] = useState({
    raptor_mini: false,
    env: "development",
  });

  useEffect(() => {
    localStorage.setItem("gicia_darkmode", darkMode.toString());
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  useEffect(() => {
    // Try to fetch server-side config/feature-flags
    // Use vite env as a fallback if server not available
    const clientFlag = import.meta.env.VITE_RAPTOR_MINI === "true";
    fetch(api("/api/config"))
      .then((r) => r.json())
      .then((c) =>
        setConfig({ raptor_mini: c.raptor_mini || clientFlag, env: c.env }),
      )
      .catch(() => {
        setConfig({ ...config, raptor_mini: clientFlag });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle navigation click
  const handleNavClick = (id: "home" | "about" | "projects") => {
    setView(id);
    if (id === "home") {
      setTimeout(() => {
        const landingSection = document.querySelector("h1");
        if (landingSection) {
          landingSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const logout = () => {
    localStorage.removeItem("gicia_token");
    localStorage.removeItem("gicia_user");
    setLoggedInUser("");
  };

  return (
    <div className="app-root">
      {/* ── Fixed header ────────────────────────────────────────── */}
      <header className="site-header">
        {/* Logo */}
        <div
          className="logo-section"
          onClick={() => {
            handleNavClick("home");
            setMenuOpen(false);
          }}
        >
          <div className="logo-mark">G</div>
          <div>
            <div className="logo-text">Gicia</div>
            <div className="logo-sub">Technologies</div>
          </div>
          {config.raptor_mini && (
            <span
              style={{
                marginLeft: 8,
                background: "#ffefc7",
                color: "#7a4c0b",
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Raptor mini (Preview)
            </span>
          )}
        </div>

        {/* Nav — nav-right lives INSIDE so it collapses in the mobile drawer */}
        <nav className={`nav-menu${menuOpen ? " nav-menu-open" : ""}`}>
          <button
            className={view === "home" ? "nav-item active" : "nav-item"}
            onClick={() => {
              handleNavClick("home");
              setMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            className={view === "about" ? "nav-item active" : "nav-item"}
            onClick={() => {
              handleNavClick("about");
              setMenuOpen(false);
            }}
          >
            About
          </button>
          <button
            className={view === "projects" ? "nav-item active" : "nav-item"}
            onClick={() => {
              handleNavClick("projects");
              setMenuOpen(false);
            }}
          >
            Projects
          </button>

          {/* Auth + dark toggle */}
          <div className="nav-right">
            {loggedInUser ? (
              <div className="user-chip">
                <div className="user-chip-avatar">
                  {loggedInUser[0].toUpperCase()}
                </div>
                <span className="user-chip-name">{loggedInUser}</span>
                <button
                  className="btn-logout"
                  onClick={logout}
                  aria-label="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn-lock"
                onClick={() => {
                  setShowLogin(true);
                  setMenuOpen(false);
                }}
                aria-label="Owner login"
              >
                <Lock size={15} />
              </button>
            )}
            <button
              className="dark-toggle"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main
        className="main-content"
        onClick={() => {
          if (menuOpen) setMenuOpen(false);
        }}
      >
        {view === "home" && <Home />}
        {view === "about" && <About />}
        {view === "projects" && <Projects />}
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-brand-row">
              <div
                className="logo-mark"
                style={{ width: 36, height: 36, fontSize: "1rem" }}
              >
                G
              </div>
              <span className="footer-brand-name">Gicia Technologies</span>
            </div>
            <p className="footer-tagline">Building tomorrow, today.</p>
          </div>

          <div className="footer-right">
            <div className="footer-social">
              <a
                href="mailto:giciadaniel575@gmail.com"
                className="footer-social-link"
                aria-label="Email"
                title="Email"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://www.instagram.com/_d.an.te_/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/daniel-gicia-ndiritu"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon size={18} />
              </a>
              <a
                href="https://github.com/Dante-254"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="GitHub"
                title="GitHub"
              >
                <GithubIcon size={18} />
              </a>
              <a
                href="https://wa.me/254792180726"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <MessageCircle size={18} />
              </a>
            </div>
            <div className="footer-contact">
              <a
                href="mailto:giciadaniel575@gmail.com"
                className="footer-contact-item"
              >
                <Mail size={14} /> giciadaniel575@gmail.com
              </a>
              <a
                href="https://wa.me/254792180726"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >
                <MessageCircle size={14} /> +254 792 180 726
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Gicia Technologies. All rights reserved.
        </div>
      </footer>

      {/* ── Owner login modal ────────────────────────────────────── */}
      {showLogin && (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <div
            className="modal-box"
            style={{ padding: "36px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError("");

                try {
                  const res = await fetch(api("/api/superusers/login"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: ownerName,
                      password: ownerPassword,
                    }),
                  });

                  const data = await res.json();

                  if (!res.ok) {
                    setLoginError(data.error || "Login failed");
                    return;
                  }

                  // Save credentials and update state
                  localStorage.setItem("gicia_token", data.token);
                  localStorage.setItem("gicia_user", data.username);
                  setLoggedInUser(data.username);
                  setShowLogin(false);
                  setOwnerPassword("");
                  setOwnerName("");
                  setView("projects");
                } catch (err) {
                  console.error("Login error:", err);
                  setLoginError("Server error, try again");
                }
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: "var(--brand)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    margin: "0 auto 16px",
                    fontFamily: "inherit",
                  }}
                >
                  G
                </div>
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text-1)",
                  }}
                >
                  Owner Login
                </h2>
                <p className="muted-text" style={{ margin: 0 }}>
                  Sign in to manage projects
                </p>
              </div>

              {/* Fields */}
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ marginBottom: 0 }}
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginTop: 8,
                  justifyContent: "center",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{
                  width: "100%",
                  marginTop: 8,
                  justifyContent: "center",
                }}
                onClick={() => {
                  setShowLogin(false);
                  setLoginError("");
                }}
              >
                Cancel
              </button>

              {loginError && <div className="error-text">{loginError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
