import { useState, useEffect } from "react";
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
                <button className="btn-logout" onClick={logout}>
                  ✕
                </button>
              </div>
            ) : (
              <button
                className="btn-owner"
                onClick={() => {
                  setShowLogin(true);
                  setMenuOpen(false);
                }}
              >
                Owner
              </button>
            )}
            <button
              className="dark-toggle"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
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
