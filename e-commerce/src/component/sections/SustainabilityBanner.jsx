export default function SustainabilityBanner() {
  return (
    <section style={{ position: "relative", height: 380, overflow: "hidden" }}>
      <img
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80&fit=crop"
        alt="Sustainability"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(0,0,0,0.35) 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingRight: 80,
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 300,
            fontStyle: "italic",
            color: "#fff",
            maxWidth: 340,
            textAlign: "right",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Stylish Sustainability In Clothing Promotes Eco-Friendly Choices For A Greater Future
        </p>

        <button
          className="btn-primary"
          style={{ borderColor: "#fff", color: "#fff" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a1a1a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
        >
          Sustainability
        </button>
      </div>
    </section>
  );
}