function About() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
      <h2 style={{ color: "#111", marginBottom: 24, fontWeight: 700 }}>
        About Gicia Technologies
      </h2>

      <div className="about-grid-fullwidth">
        <div className="about-box">
          <h3 style={{ marginTop: 0 }}>Who we are</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            Gicia Technologies is a locally owned Kenyan tech company specializing in innovative technology solutions and software development. We serve organizations and individuals with a focus on technical excellence, cutting-edge solutions, and timely delivery.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Vision</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            To be Kenya’s most innovative tech company, shaping the future with cutting-edge solutions that connect people, businesses, and possibilities.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Mission</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            To create innovative technology solutions that simplify lives, boost business efficiency, and inspire growth—turning ideas into smart, real-world impact.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Values</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            Professionalism, integrity, creativity and customer focus that
            delivers lasting results.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
