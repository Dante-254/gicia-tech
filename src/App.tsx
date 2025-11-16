import { useState } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import "./App.css";

function App() {
  const [view, setView] = useState<"home" | "about" | "projects">("home");
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [createUserError, setCreateUserError] = useState("");

  // Theme colors
  const THEME_COLOR = "#f97416";
  const THEME_DARK = "#ea6e0a";
  const TEXT_DARK = "#1a1a1a";
  const TEXT_LIGHT = "#f7f7fa";
  const BORDER_COLOR = "#e5e5e5";

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

  // Scroll to services section in Home page
  function handleServicesClick() {
    setView("home");
    setTimeout(() => {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }

  return (
    <div>
      <header className="navbar">
        <nav
          className="navbar-nav"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {/* Company Logo and Name */}
          <div
            className="navbar-brand"
            onClick={() => handleNavClick("home")}
            title="Go to Home"
          >
            <div className="navbar-logo">🏗️</div>
            <div className="navbar-company-name">JKBG Construction</div>
          </div>

          {/* Navigation Menu */}
          <div style={{ display: "flex", gap: 8, flex: 1 }}>
            <button
              className="navbar-btn"
              onClick={() => handleNavClick("home")}
              title="Go to Home page"
            >
              Home
            </button>
            <button
              className="navbar-btn"
              onClick={handleServicesClick}
              title="View our services"
            >
              Services
            </button>
            <button
              className="navbar-btn"
              onClick={() => handleNavClick("projects")}
              title="View our projects"
            >
              Projects
            </button>
            <button
              className="navbar-btn"
              onClick={() => handleNavClick("about")}
              title="Learn about us"
            >
              About
            </button>
          </div>
          {/* Auth Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isOwner ? (
              <>
                <button
                  style={{
                    fontWeight: 600,
                    background: THEME_COLOR,
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer",
                    color: "#fff",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      THEME_DARK;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 4px 12px rgba(249, 116, 21, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      THEME_COLOR;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "none";
                  }}
                  onClick={() => setShowLogin(true)}
                  title="Login as owner"
                >
                  Owner Login
                </button>
                <button
                  style={{
                    fontWeight: 600,
                    background: "rgba(249, 116, 21, 0.1)",
                    border: `2px solid ${THEME_COLOR}`,
                    borderRadius: 6,
                    padding: "6px 16px",
                    cursor: "pointer",
                    color: THEME_COLOR,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      THEME_COLOR;
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(249, 116, 21, 0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      THEME_COLOR;
                  }}
                  onClick={() => setShowCreateUser(true)}
                  title="Create a new super user account"
                >
                  Create Super User
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontWeight: 600,
                    color: THEME_COLOR,
                    marginRight: 8,
                    fontSize: "0.95rem",
                  }}
                >
                  ✓ {ownerName ? `${ownerName}` : "Super User"}
                </span>
                <button
                  style={{
                    fontWeight: 600,
                    background: "rgba(249, 116, 21, 0.1)",
                    border: `2px solid ${THEME_COLOR}`,
                    borderRadius: 6,
                    padding: "6px 16px",
                    cursor: "pointer",
                    color: THEME_COLOR,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#fee2e2";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "#991b1b";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#991b1b";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(249, 116, 21, 0.1)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      THEME_COLOR;
                    (e.currentTarget as HTMLButtonElement).style.color =
                      THEME_COLOR;
                  }}
                  onClick={() => {
                    setIsOwner(false);
                    setOwnerPassword("");
                    setOwnerName("");
                  }}
                  title="Logout from owner account"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <main style={{ paddingTop: 80 }}>
        {showLogin && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (ownerPassword === "jkbgowner2025") {
                  setIsOwner(true);
                  setShowLogin(false);
                  setLoginError("");
                  if (!ownerName) {
                    setOwnerName("Super User");
                  }
                } else {
                  setLoginError("Incorrect password. Please try again.");
                }
              }}
              style={{
                background: "#fff",
                padding: 32,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                minWidth: 380,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: 12,
                }}
              >
                🔐
              </div>
              <h3
                style={{
                  marginBottom: 8,
                  color: TEXT_DARK,
                  fontSize: "1.5rem",
                }}
              >
                Owner Login
              </h3>
              <p
                style={{
                  color: "#666",
                  marginBottom: 20,
                  fontSize: "0.9rem",
                }}
              >
                Access owner dashboard and management tools
              </p>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter username"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER_COLOR}`,
                  marginBottom: 12,
                  width: "100%",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = THEME_COLOR;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(249, 116, 21, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = BORDER_COLOR;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER_COLOR}`,
                  marginBottom: 20,
                  width: "100%",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = THEME_COLOR;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(249, 116, 21, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = BORDER_COLOR;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  background: THEME_COLOR,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#fff",
                  marginBottom: 8,
                  width: "100%",
                  transition: "all 0.3s ease",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    THEME_DARK;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 12px rgba(249, 116, 21, 0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    THEME_COLOR;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                Login
              </button>
              <button
                type="button"
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  color: TEXT_DARK,
                  width: "100%",
                  transition: "all 0.3s ease",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    TEXT_LIGHT;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
                onClick={() => {
                  setShowLogin(false);
                  setLoginError("");
                }}
              >
                Cancel
              </button>
              {loginError && (
                <div
                  style={{
                    color: "#991b1b",
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fee2e2",
                    borderRadius: 6,
                    width: "100%",
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {loginError}
                </div>
              )}
            </form>
          </div>
        )}
        {showCreateUser && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newUserName || !newUserPassword) {
                  setCreateUserError(
                    "Username and password are both required."
                  );
                  return;
                }
                if (newUserPassword.length < 6) {
                  setCreateUserError("Password must be at least 6 characters.");
                  return;
                }
                setShowCreateUser(false);
                setCreateUserError("");
                setNewUserName("");
                setNewUserPassword("");
              }}
              style={{
                background: "#fff",
                padding: 32,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                minWidth: 380,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: 12,
                }}
              >
                👤
              </div>
              <h3
                style={{
                  marginBottom: 8,
                  color: TEXT_DARK,
                  fontSize: "1.5rem",
                }}
              >
                Create Super User
              </h3>
              <p
                style={{
                  color: "#666",
                  marginBottom: 20,
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                Set up a new super user account with admin privileges
              </p>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Choose a username"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER_COLOR}`,
                  marginBottom: 12,
                  width: "100%",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = THEME_COLOR;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(249, 116, 21, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = BORDER_COLOR;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Create a strong password"
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER_COLOR}`,
                  marginBottom: 20,
                  width: "100%",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = THEME_COLOR;
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(249, 116, 21, 0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = BORDER_COLOR;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  fontWeight: 600,
                  background: THEME_COLOR,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#fff",
                  marginBottom: 8,
                  width: "100%",
                  transition: "all 0.3s ease",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    THEME_DARK;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 12px rgba(249, 116, 21, 0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    THEME_COLOR;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                Create User
              </button>
              <button
                type="button"
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  color: TEXT_DARK,
                  width: "100%",
                  transition: "all 0.3s ease",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    TEXT_LIGHT;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
                onClick={() => {
                  setShowCreateUser(false);
                  setCreateUserError("");
                }}
              >
                Cancel
              </button>
              {createUserError && (
                <div
                  style={{
                    color: "#991b1b",
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#fee2e2",
                    borderRadius: 6,
                    width: "100%",
                    fontSize: "0.9rem",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {createUserError}
                </div>
              )}
            </form>
          </div>
        )}
        {view === "home" && <Home />}
        {view === "about" && <About />}
        {view === "projects" && <Projects /*isOwner={isOwner}*/ />}
      </main>
    </div>
  );
}

export default App;
