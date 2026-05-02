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

  const API_BASE = import.meta.env.VITE_API_BASE || "";
  const api = (p: string) => (API_BASE ? `${API_BASE}${p}` : p);

  useEffect(() => {
    fetch(api("/api/projects"))
      .then((res) => res.json())
      .then((data) => {
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
      {/* HERO SECTION */}
      <section className="hero-section">
        {featuredProjects.map((p, idx) => (
          <div
            key={p.id}
            className={`hero-slide ${idx === activeIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${p.image})` }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
            zIndex: 1,
          }}
        />
        <div className="hero-overlay">
          <h1 className="hero-title">
            Building Tomorrow,
            <br />
            Today
          </h1>
          <p className="hero-subtitle">
            Discover exceptional projects built with integrity and excellence
          </p>
        </div>
      </section>

      {/* SERVICES + FEATURED PROJECTS */}
      <div className="page-wrap">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">What we do best</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 56,
          }}
        >
          {[
            {
              image:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80&fit=crop",
              name: "Software Development",
              desc: "Custom web and desktop applications built to solve real business problems — fast, clean, and maintainable.",
            },
            {
              image:
                "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80&fit=crop",
              name: "Cloud Solutions",
              desc: "Scalable, secure cloud infrastructure that grows with your business and keeps your data always available.",
            },
            {
              image:
                "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&fit=crop",
              name: "Mobile Development",
              desc: "Polished Android and iOS apps with intuitive interfaces that users actually enjoy using every day.",
            },
          ].map((s, i) => (
            <div key={i} className="service-card">
              <img src={s.image} alt={s.name} className="service-card-img" />
              <div className="service-card-body">
                <h3 className="service-name">{s.name}</h3>
                <p className="service-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FEATURED PROJECTS */}
        {featuredProjects.length > 0 && (
          <>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-subtitle">Our latest work</p>
            <div className="project-grid">
              {featuredProjects.slice(0, 6).map((project) => (
                <div key={project.id} className="project-card">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="project-img"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="project-img-placeholder">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
