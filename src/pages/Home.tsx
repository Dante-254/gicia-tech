import { useState, useEffect } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
  status: string;
  image: string;
};

function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("http://localhost:4000/api/projects")
      .then((res) => res.json())
      .then((data) => setFeaturedProjects(data.slice(0, 3)))
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, []);

  useEffect(() => {
    if (!featuredProjects || featuredProjects.length === 0) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % featuredProjects.length);
    }, 3500);
    return () => clearInterval(id);
  }, [featuredProjects]);

  return (
    <div>
      <section className="hero-slideshow" style={{ marginBottom: 24 }}>
        {featuredProjects.length === 0 ? (
          <div
            style={{
              width: "100%",
              minHeight: "40vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#222",
              color: "#fff",
              borderRadius: 12,
            }}
          >
            <div className="hero-overlay">
              <h1 style={{ fontSize: "2rem", margin: 0 }}>JKBG Construction</h1>
              <p style={{ marginTop: 8, opacity: 0.9 }}>
                Building tomorrow, today
              </p>
            </div>
          </div>
        ) : (
          featuredProjects.map((p, idx) => (
            <div
              key={p.id}
              className={`hero-slide ${idx === activeIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${p.image})`, height: "50vh" }}
            />
          ))
        )}

        <div className="hero-overlay">
          <h1 style={{ fontSize: "2.4rem", margin: 0, fontWeight: 800 }}>
            JKBG Construction Company Ltd
          </h1>
          <p style={{ marginTop: 8, opacity: 0.95 }}>
            Building projects with integrity and excellence
          </p>
        </div>
      </section>
      <div
        id="services"
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "32px 16px",
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ color: "#111", marginBottom: 18, fontWeight: 700 }}>
          Our Services
        </h2>
        <div
          style={{
            color: "#222",
            fontSize: "1.1rem",
            lineHeight: 2,
            paddingLeft: 0,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: 32,
          }}
        >
          <div>Architectural designs</div>
          <div>Structural designs</div>
          <div>Bill of quantities</div>
          <div>Plan Approvals</div>
          <div>Project Management</div>
          <div>Contractor</div>
          <div>Consultancy</div>
          <div>General construction</div>
          <div>Electrical works</div>
        </div>
        <h2 style={{ color: "#111", margin: "32px 0 18px 0", fontWeight: 700 }}>
          Featured Projects
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: 24,
          }}
        >
          {featuredProjects.map((project: Project) => (
            <div
              key={project.id}
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#f7f7fa",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {project.image && (
                <img
                  src={project.image}
                  alt={project.title}
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
              )}
              <h3
                style={{
                  margin: "8px 0 0 0",
                  color: "#222",
                  textAlign: "center",
                  fontSize: "1.1rem",
                }}
              >
                {project.title}
              </h3>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  background:
                    project.status === "Available" ? "#d1fae5" : "#fee2e2",
                  color: project.status === "Available" ? "#065f46" : "#991b1b",
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
