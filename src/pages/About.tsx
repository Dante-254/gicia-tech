function About() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>
      <h2 style={{ color: "#111", marginBottom: 24, fontWeight: 700 }}>
        About JKBG Construction Company Ltd
      </h2>

      <div className="about-grid-fullwidth">
        <div className="about-box">
          <h3 style={{ marginTop: 0 }}>Who we are</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            JKBG is a locally owned Kenyan company that specializes in
            engineering construction and construction project management. We
            serve organizations and individuals with a focus on technical
            excellence and on-time delivery.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Vision</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            A regional market leader in the provision of civil engineering and
            building construction services.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Mission</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            Provide efficient, affordable, sustainable and cost-effective
            services of the highest quality.
          </p>
        </div>

        <div className="about-box">
          <h3>Our Values</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            Professionalism, integrity, creativity and customer focus that
            delivers lasting results.
          </p>
        </div>

        <div className="about-box">
          <h3>Expertise</h3>
          <ul style={{ paddingLeft: 18, color: "#444", lineHeight: 1.6 }}>
            <li>Diverse project capabilities</li>
            <li>Technological innovation (BIM, management tools)</li>
            <li>Expert craftsmanship</li>
            <li>Commitment to safety</li>
          </ul>
        </div>

        <div className="about-box">
          <h3>Approach</h3>
          <p style={{ color: "#444", lineHeight: 1.6 }}>
            We work closely with clients to interpret visions into constructable
            solutions, maintaining communication throughout the project
            lifecycle.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
