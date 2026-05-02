function About() {
  const sections = [
    {
      icon: "🏢",
      title: "Who We Are",
      content:
        "Gicia Technologies is a locally owned Kenyan tech company specializing in innovative technology solutions and software development. We serve organizations and individuals with a focus on technical excellence, cutting-edge solutions, and timely delivery.",
    },
    {
      icon: "🔭",
      title: "Our Vision",
      content:
        "To be Kenya's most innovative tech company, shaping the future with cutting-edge solutions that connect people, businesses, and possibilities.",
    },
    {
      icon: "🚀",
      title: "Our Mission",
      content:
        "To create innovative technology solutions that simplify lives, boost business efficiency, and inspire growth — turning ideas into smart, real-world impact.",
    },
    {
      icon: "💎",
      title: "Our Values",
      content:
        "Professionalism, integrity, creativity, and an unwavering customer focus that delivers results that last.",
    },
  ];

  return (
    <div className="page-wrap" style={{ paddingTop: 48 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 className="section-title">About Gicia Technologies</h2>
        <p
          className="section-subtitle"
          style={{ maxWidth: 560, margin: "0 auto" }}
        >
          A Kenyan-born technology company on a mission to build innovative,
          impactful solutions.
        </p>
      </div>
      <div className="about-grid">
        {sections.map((s, i) => (
          <div key={i} className="about-box">
            <div className="about-box-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
