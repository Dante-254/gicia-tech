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
    const API_BASE = import.meta.env.VITE_API_BASE || "";
    const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

    fetch(api("/api/projects"))
      .then((res) => res.json())
      .then((data) => {
        // Convert ALL project images to absolute URLs and encode them
        const projects = data.map((p: Project) => ({
          ...p,
          image:
            p.image && p.image.startsWith("http")
              ? p.image
              : API_BASE
              ? `${API_BASE}${encodeURI(p.image)}`
              : p.image,
        }));
        setFeaturedProjects(projects);
      })
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
              <h1 style={{ fontSize: "2rem", margin: 0 }}>
                Gicia Technologies
              </h1>
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
            Gicia Technologies
          </h1>
          <p style={{ marginTop: 8, opacity: 0.95 }}>
            Building projects with integrity and excellence
          </p>
        </div>
      </section>
      <div
        id="services"
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0",
          }}
        >
          <h2 style={{ color: "#111", marginBottom: 24, fontWeight: 700 }}>
            Our Services
          </h2>
          <div
            className="services-section"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: 32,
            }}
          >
            {[
              {
                icon: "💻",
                name: "Software Development",
                desc: "Custom applications and solutions",
              },
              {
                icon: "☁️",
                name: "Cloud Solutions",
                desc: "Scalable and secure cloud services",
              },
              {
                icon: "📱",
                name: "Mobile App Development",
                desc: "Intuitive apps for Android and iOS",
              },
            ].map((service, idx) => (
              <div key={idx} className="service-card">
                <div style={{ fontSize: "2.4rem", marginBottom: "8px" }}>
                  {service.icon}
                </div>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    color: "var(--text-primary, #222)",
                    fontSize: "1.05rem",
                  }}
                >
                  {service.name}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-secondary, #666)",
                    fontSize: "0.85rem",
                  }}
                >
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
          <h2
            style={{ color: "#111", margin: "32px 0 18px 0", fontWeight: 700 }}
          >
            Featured Projects
          </h2>
          <div
            className="featured-projects-section"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: 24,
            }}
          >
            {featuredProjects.map((project: Project) => (
              <div key={project.id} className="project-card">
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-img"
                    style={{ maxHeight: 120, marginBottom: 8 }}
                  />
                )}
                <h3 style={{ margin: "8px 0 0 0", textAlign: "center" }}>
                  {project.title}
                </h3>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 12,
                    background:
                      project.status === "Available" ? "#d1fae5" : "#fee2e2",
                    color:
                      project.status === "Available" ? "#065f46" : "#991b1b",
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
    </div>
  );
}

export default Home;
