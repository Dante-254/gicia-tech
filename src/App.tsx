import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import "./App.css";

function App() {
  const [view, setView] = useState<"home" | "about" | "projects">("home");
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createUserError, setCreateUserError] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("jkbg_darkmode") === "true";
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [config, setConfig] = useState({
    raptor_mini: false,
    env: "development",
  });

  useEffect(() => {
    localStorage.setItem("jkbg_darkmode", darkMode.toString());
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
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) =>
        setConfig({ raptor_mini: c.raptor_mini || clientFlag, env: c.env })
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

  // Scroll to services section in Home page (utility function, could be used by Home component)
  // Removed to simplify, can be added back if needed

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="logo-section">
          <div
            className="logo"
            onClick={() => {
              handleNavClick("home");
              setMenuOpen(false);
            }}
          >
            JKBG
          </div>
          <span className="company-name">Construction</span>
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
        <nav className={`nav-menu ${menuOpen ? "nav-menu-open" : ""}`}>
          <button
            className="nav-item"
            onClick={() => {
              handleNavClick("home");
              setMenuOpen(false);
            }}
          >
            Home
          </button>
          <button
            className="nav-item"
            onClick={() => {
              handleNavClick("about");
              setMenuOpen(false);
            }}
          >
            About
          </button>
          <button
            className="nav-item"
            onClick={() => {
              handleNavClick("projects");
              setMenuOpen(false);
            }}
          >
            Projects
          </button>
          <div className="nav-right">
            <button className="btn-icon" onClick={() => setShowLogin(true)}>
              Owner
            </button>
            <button
              className="dark-toggle"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </nav>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          ☰
        </button>
      </header>

      <main
        className="main-content"
        onClick={() => {
          if (menuOpen) setMenuOpen(false);
        }}
      >
        {view === "home" && <Home />}
        {view === "about" && <About />}
        {view === "projects" && <Projects />}

        {showLogin && (
          <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (ownerPassword === "jkbgowner2025") {
                    setShowLogin(false);
                    setLoginError("");
                    if (!ownerName) setOwnerName("Super User");
                  } else {
                    setLoginError("Incorrect password. Please try again.");
                  }
                }}
              >
                <div className="owner-modal-icon">🔐</div>
                <h3 className="page-title">Owner Login</h3>
                <p className="muted-text">
                  Access owner dashboard and management tools
                </p>
                <input
                  className="form-input"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter username"
                />
                <input
                  className="form-input"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <div style={{ marginTop: 12 }}>
                  <button type="submit" className="btn-primary">
                    Login
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowLogin(false);
                      setLoginError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {loginError && <div className="error-text">{loginError}</div>}
              </form>
            </div>
          </div>
        )}

        {showCreateUser && (
          <div
            className="modal-backdrop"
            onClick={() => setShowCreateUser(false)}
          >
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUserName || !newUserPassword) {
                    setCreateUserError(
                      "Username and password are both required."
                    );
                    return;
                  }
                  if (newUserPassword.length < 6) {
                    setCreateUserError(
                      "Password must be at least 6 characters."
                    );
                    return;
                  }
                  setShowCreateUser(false);
                  setCreateUserError("");
                  setNewUserName("");
                  setNewUserPassword("");
                }}
              >
                <div className="owner-modal-icon">👤</div>
                <h3 className="page-title">Create Super User</h3>
                <p className="muted-text">
                  Set up a new super user account with admin privileges
                </p>
                <input
                  className="form-input"
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Choose a username"
                />
                <input
                  className="form-input"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Create a strong password"
                />
                <div style={{ marginTop: 12 }}>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowCreateUser(false);
                      setCreateUserError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {createUserError && (
                  <div className="error-text">{createUserError}</div>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
