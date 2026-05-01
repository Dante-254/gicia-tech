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
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createUserError, setCreateUserError] = useState("");
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
            Gicia
          </div>
          <span className="company-name">Technologies</span>
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
            {loggedInUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  👤 {loggedInUser}
                </span>
                <button
                  className="btn-icon"
                  onClick={() => {
                    localStorage.removeItem("gicia_token");
                    localStorage.removeItem("gicia_user");
                    setLoggedInUser("");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn-icon" onClick={() => setShowLogin(true)}>
                Owner
              </button>
            )}
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
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginError(""); // reset error

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
                <h3 className="page-title">Owner Login</h3>
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
                      "Username and password are both required.",
                    );
                    return;
                  }
                  if (newUserPassword.length < 6) {
                    setCreateUserError(
                      "Password must be at least 6 characters.",
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
