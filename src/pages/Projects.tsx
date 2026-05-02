import React, { useState, useEffect } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  image: string;
  created_by?: string;
  created_at?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "";
const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pageView, setPageView] = useState<"list" | "add">("list");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Available",
    image: "",
  });
  const [superUser, setSuperUser] = useState<string>(
    localStorage.getItem("gicia_user") || "",
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Modal / edit state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    image: "",
  });

  // Fetch projects from backend
  useEffect(() => {
    const _API = import.meta.env.VITE_API_BASE || "";
    const _api = (p: string) => (_API ? `${_API}${p}` : p);
    fetch(_api("/api/projects"))
      .then((res) => res.json())
      .then((data) => {
        const fetched = data.map((p: Project) => ({
          ...p,
          image:
            p.image && p.image.startsWith("http")
              ? p.image
              : _API
                ? `${_API}${encodeURI(p.image)}`
                : p.image,
        }));
        setProjects(fetched);
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, [API_BASE]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    fetch(api("/api/upload"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("gicia_token")}`,
      },
      body: fd,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setForm((prev) => ({ ...prev, image: data.url }));
        }
      })
      .catch((err) => console.error("Upload failed:", err));
  };

  // Superuser login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch(api("/api/superusers/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json();
    if (data.token && data.username) {
      setSuperUser(data.username);
      localStorage.setItem("gicia_token", data.token);
      localStorage.setItem("gicia_user", data.username);
      setLoginForm({ username: "", password: "" });
      setShowLoginModal(false);
    } else {
      setLoginError(data.error || "Login failed");
    }
  };

  // Logout
  const logout = () => {
    setSuperUser("");
    localStorage.removeItem("gicia_token");
    localStorage.removeItem("gicia_user");
  };

  // Add project (only if superUser is set)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!superUser) return;
    const res = await fetch(api("/api/projects"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("gicia_token")}`,
      },
      body: JSON.stringify({ ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        setProjects([...projects, data.project]);
      }
      setForm({ title: "", description: "", status: "Available", image: "" });
      setPageView("list");
    }
  };

  const openProject = (p: Project) => {
    setSelectedProject(p);
    setIsEditing(false);
    setEditForm({
      title: p.title,
      description: p.description,
      status: p.status,
      image: p.image,
    });
  };

  const closeModal = () => {
    setSelectedProject(null);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedProject) return;
    setIsEditing(true);
    setEditForm({
      title: selectedProject.title,
      description: selectedProject.description,
      status: selectedProject.status,
      image: selectedProject.image,
    });
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProject) return;
    const res = await fetch(api(`/api/projects/${selectedProject.id}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("gicia_token")}`,
      },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === data.project.id ? data.project : p)),
        );
        setSelectedProject(data.project);
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const res = await fetch(api(`/api/projects/${selectedProject.id}`), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("gicia_token")}`,
      },
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      closeModal();
    }
  };

  // ── ADD PROJECT PAGE ──────────────────────────────────────────────────────────
  if (pageView === "add") {
    return (
      <div className="add-project-page">
        <div className="page-wrap">
          <div className="add-form-header">
            <button className="btn-back" onClick={() => setPageView("list")}>
              ← Back to Projects
            </button>
            <h2 className="section-title" style={{ margin: 0 }}>
              Add New Project
            </h2>
          </div>
          <div className="add-form-card">
            <form onSubmit={handleSubmit}>
              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">Project Image</label>
                {form.image ? (
                  <div className="upload-preview">
                    <img src={form.image} alt="preview" />
                    <button
                      type="button"
                      className="upload-preview-remove"
                      onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="upload-zone" htmlFor="img-upload">
                    <span className="upload-zone-icon">🖼️</span>
                    <p className="upload-zone-text">Click to upload an image</p>
                    <p className="upload-zone-hint">PNG, JPG up to 5MB</p>
                    <input
                      id="img-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input
                  className="form-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern Apartment Complex"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this project..."
                  required
                />
              </div>

              {/* Status pills */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="status-pills">
                  <button
                    type="button"
                    className={`status-pill ${
                      form.status === "Available" ? "selected-available" : ""
                    }`}
                    onClick={() =>
                      setForm((f) => ({ ...f, status: "Available" }))
                    }
                  >
                    ✓ Available
                  </button>
                  <button
                    type="button"
                    className={`status-pill ${
                      form.status === "Sold" ? "selected-sold" : ""
                    }`}
                    onClick={() => setForm((f) => ({ ...f, status: "Sold" }))}
                  >
                    Sold
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: "13px", justifyContent: "center" }}
                >
                  Post Project
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setPageView("list")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── PROJECTS LIST ─────────────────────────────────────────────────────────────
  return (
    <div className="page-wrap">
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            Projects
          </h2>
          <p
            style={{
              color: "var(--text-3)",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {superUser ? (
          <button className="btn-primary" onClick={() => setPageView("add")}>
            + Add Project
          </button>
        ) : (
          <button
            className="btn-secondary"
            onClick={() => setShowLoginModal(true)}
          >
            Owner Login
          </button>
        )}
      </div>

      {/* Owner banner */}
      {superUser && (
        <div className="owner-banner">
          <span>
            ✓ Logged in as <strong>{superUser}</strong>
          </span>
          <button className="owner-logout-btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      {/* Project grid / empty state */}
      {projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--text-3)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📁</div>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--text-2)",
            }}
          >
            No projects yet
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Projects will appear here once added.
          </p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => openProject(project)}
            >
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-img"
                />
              )}
              <div className="project-card-body">
                <h3 className="project-card-title">{project.title}</h3>
                <p className="project-card-desc">{project.description}</p>
                <span
                  className={`badge ${
                    project.status === "Available"
                      ? "badge-available"
                      : "badge-sold"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECT DETAIL MODAL ───────────────────────────────────────────────── */}
      {selectedProject && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-box"
            style={{ padding: 0, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isEditing ? (
              <>
                {selectedProject.image && (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="modal-img"
                    style={{ borderRadius: 0, marginBottom: 0 }}
                  />
                )}
                <div style={{ padding: "24px 28px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "var(--text-1)",
                      }}
                    >
                      {selectedProject.title}
                    </h2>
                    <span
                      className={`badge ${
                        selectedProject.status === "Available"
                          ? "badge-available"
                          : "badge-sold"
                      }`}
                    >
                      {selectedProject.status}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-2)",
                      fontSize: "0.925rem",
                      lineHeight: 1.7,
                      margin: "0 0 16px",
                    }}
                  >
                    {selectedProject.description}
                  </p>
                  <p
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.8rem",
                      margin: 0,
                    }}
                  >
                    Posted by {selectedProject.created_by ?? "Unknown"}
                  </p>
                  <div className="modal-actions">
                    {superUser && (
                      <>
                        <button className="btn-ghost" onClick={handleStartEdit}>
                          Edit
                        </button>
                        <button className="btn-danger" onClick={handleDelete}>
                          Delete
                        </button>
                      </>
                    )}
                    <button className="btn-primary" onClick={closeModal}>
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: "28px" }}>
                <h3 style={{ margin: "0 0 24px", fontWeight: 700 }}>
                  Edit Project
                </h3>
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      className="form-input"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <div className="status-pills">
                      <button
                        type="button"
                        className={`status-pill ${
                          editForm.status === "Available"
                            ? "selected-available"
                            : ""
                        }`}
                        onClick={() =>
                          setEditForm((f) => ({ ...f, status: "Available" }))
                        }
                      >
                        ✓ Available
                      </button>
                      <button
                        type="button"
                        className={`status-pill ${
                          editForm.status === "Sold" ? "selected-sold" : ""
                        }`}
                        onClick={() =>
                          setEditForm((f) => ({ ...f, status: "Sold" }))
                        }
                      >
                        Sold
                      </button>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOGIN MODAL ────────────────────────────────────────────────────────── */}
      {showLoginModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="modal-box"
            style={{ padding: "36px 32px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "var(--brand)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  margin: "0 auto 16px",
                }}
              >
                G
              </div>
              <h3
                style={{
                  margin: "0 0 6px",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                Owner Login
              </h3>
              <p className="muted-text">Sign in to manage your projects</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  name="username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "12px",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{
                  width: "100%",
                  padding: "12px",
                  justifyContent: "center",
                  marginTop: 8,
                }}
                onClick={() => setShowLoginModal(false)}
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

export default Projects;
