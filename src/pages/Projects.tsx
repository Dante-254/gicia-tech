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

// type ProjectsProps = {
//   isOwner?: boolean;
// };

function Projects(/*{ isOwner = false }: ProjectsProps*/) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Available",
    image: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [superUser, setSuperUser] = useState<string>(
    localStorage.getItem("jkbg_user") || ""
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "";

  // helper to build API urls; if API_BASE is empty we use relative paths
  const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

  // Fetch projects from backend API
  useEffect(() => {
    fetch(api("/api/projects"))
      .then((res) => res.json())
      .then((data) => {
        // Convert relative image URLs to absolute and encode
        const projects = data.map((p: Project) => ({
          ...p,
          image:
            p.image && p.image.startsWith("http")
              ? p.image
              : API_BASE
              ? `${API_BASE}${encodeURI(p.image)}`
              : p.image,
        }));
        setProjects(projects);
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Upload to server (authenticated)
    const fd = new FormData();
    fd.append("image", file);
    fetch(api("/api/upload"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jkbg_token")}`,
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
      localStorage.setItem("jkbg_token", data.token);
      localStorage.setItem("jkbg_user", data.username);
      setLoginForm({ username: "", password: "" });
      setShowLoginModal(false);
    } else {
      setLoginError(data.error || "Login failed");
    }
  };

  // NOTE: Superuser creation should be done server-side (CLI or protected path).
  // For security, registration UI has been removed so customers cannot create superusers.

  // Add project (only if superUser is set)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!superUser) return;
    const res = await fetch(api("/api/projects"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jkbg_token")}`,
      },
      body: JSON.stringify({ ...form }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        setProjects([...projects, data.project]);
      }
      setForm({ title: "", description: "", status: "Available", image: "" });
      setShowForm(false);
    }
  };

  // Modal and edit/delete state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    image: "",
  });

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
    const res = await fetch(`${api(`/api/projects/${selectedProject.id}`)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jkbg_token")}`,
      },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.project) {
        setProjects((prev) =>
          prev.map((p) => (p.id === data.project.id ? data.project : p))
        );
        setSelectedProject(data.project);
        setIsEditing(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const res = await fetch(`${api(`/api/projects/${selectedProject.id}`)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jkbg_token")}`,
      },
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      closeModal();
    }
  };

  return (
    <div className="page-container projects-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ color: "#111", margin: 0, fontWeight: 700 }}>Projects</h2>
        {!superUser ? (
          <button
            className="btn-primary"
            onClick={() => setShowLoginModal(true)}
            style={{
              padding: "10px 16px",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            🔐 Login
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "10px 16px", fontSize: "1.4rem" }}
            title="Add new project"
          >
            {showForm ? "✕" : "+"}
          </button>
        )}
      </div>

      {superUser && (
        <div className="owner-banner">
          <span>✓ Logged in as: {superUser}</span>
          <button
            className="owner-logout-btn btn-secondary"
            onClick={() => {
              setSuperUser("");
              localStorage.removeItem("jkbg_token");
              localStorage.removeItem("jkbg_user");
            }}
          >
            Logout
          </button>
        </div>
      )}

      {!superUser && (
        <div style={{ marginBottom: 12, color: "#666", fontSize: "0.95rem" }}>
          Superuser accounts must be created in the backend (server) by the
          owner.
        </div>
      )}

      {showLoginModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLoginModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleLogin}>
              <h3>Superuser Login</h3>
              <input
                className="form-input"
                name="username"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                placeholder="Superuser Username"
                required
              />
              <input
                className="form-input"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                placeholder="Password"
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginBottom: 8 }}
              >
                Login
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
              {loginError && (
                <div style={{ color: "#991b1b", marginTop: 8 }}>
                  {loginError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showForm && superUser && (
        <form onSubmit={handleSubmit} className="form-panel">
          <h3>Add New Project</h3>
          <input
            className="form-input"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Project Title"
            required
          />
          <textarea
            className="form-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Project Description"
            required
          />
          <select
            className="form-select"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "block", marginBottom: 10 }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
          >
            Post Project
          </button>
        </form>
      )}

      <div className="project-grid">
        {projects.length === 0 ? (
          <p>No projects posted yet.</p>
        ) : (
          projects.map((project: Project) => (
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
              <h3
                style={{
                  margin: "8px 0 0 0",
                  color: "#222",
                  textAlign: "center",
                }}
              >
                {project.title}
              </h3>
              <p
                style={{ margin: "8px 0", color: "#444", textAlign: "center" }}
              >
                {project.description}
              </p>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  background:
                    project.status === "Available" ? "#d1fae5" : "#fee2e2",
                  color: project.status === "Available" ? "#065f46" : "#991b1b",
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {project.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Project details modal */}
      {selectedProject && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {!isEditing ? (
              <div>
                {selectedProject.image && (
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="modal-img"
                  />
                )}
                <h2 style={{ marginTop: 0 }}>{selectedProject.title}</h2>
                <p>{selectedProject.description}</p>
                <p>
                  <strong>Status:</strong> {selectedProject.status}
                </p>
                <p>
                  <strong>Created By:</strong>{" "}
                  {selectedProject.created_by ?? "Unknown"}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    justifyContent: "flex-end",
                  }}
                >
                  {superUser && (
                    <>
                      <button
                        className="btn-secondary"
                        onClick={handleStartEdit}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={handleDelete}
                        style={{
                          background: "#fee2e2",
                          borderColor: "#fca5a5",
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  <button className="btn-primary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                />
                <select
                  name="status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  style={{ width: "100%", padding: 8, marginBottom: 8 }}
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </select>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
