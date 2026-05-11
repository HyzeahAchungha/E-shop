import Home from '../../assets/home.jpg'

export default function Hero() {
  return (
    <div style={{ position: "relative", height: "88vh", overflow: "hidden", background: "#f0ede8" }}>
      <img
        src={Home}
        alt="Hero"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 60%)",
        }}
      />

      {/* Copy */}
      <div style={{ position: "absolute", top: "50%", left: "7%", transform: "translateY(-50%)" }}>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#888",
            marginBottom: 12,
          }}
        >
          New Arrivals · Spring 2026
        </p>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 52,
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1.2,
            margin: "0 0 28px",
            color: "#1a1a1a",
            maxWidth: 420,
          }}
        >
          Elegance In Simplicity,<br />Earth's Harmony
        </h1>

        <button className="btn-primary">New In</button>
      </div>
    </div>
  );
}