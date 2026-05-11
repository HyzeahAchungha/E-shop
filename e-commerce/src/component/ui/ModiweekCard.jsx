import { useState } from "react";

export default function ModiweekCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div
      style={{ cursor: "pointer", flexShrink: 0, width: "calc(20% - 10px)", minWidth: 160 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          aspectRatio: "2/3",
          background: "#f0ede8",
        }}
      >
        <img
          src={item.img}
          alt={item.day}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          style={{
            position: "absolute",
            top: 10, right: 10,
            background: "rgba(255,255,255,0.82)",
            border: "none",
            borderRadius: "50%",
            width: 30, height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={liked ? "#c0392b" : "none"}
            stroke={liked ? "#c0392b" : "#666"}
            strokeWidth="1.8"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {item.day}
      </p>
    </div>
  );
}