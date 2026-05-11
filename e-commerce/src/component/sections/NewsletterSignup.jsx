import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) return;
    alert(`Thanks! You've subscribed with ${email}`);
    setEmail("");
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        padding: "52px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
      }}
    >
      {/* Label */}
      <div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: "#fff", margin: "0 0 4px", fontWeight: 300 }}>
          Join Our Club
        </p>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", margin: 0 }}>
          Get 15% Off For Your Birthday
        </p>
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          flex: 1,
          maxWidth: 400,
          alignItems: "center",
        }}
      >
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: "transparent",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "8px 18px",
            fontSize: 11,
            fontFamily: "'Jost', sans-serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Subscribe
        </button>
      </div>

      {/* Disclaimer */}
      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#555", maxWidth: 260, lineHeight: 1.6 }}>
        By submitting your email, you agree to receive advertising emails from Modimal.
      </p>
    </div>
  );
}