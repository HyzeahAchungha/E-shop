import { useState } from "react";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const colorKeys = Object.keys(product.colorVariants);
  const [selectedColor, setSelectedColor] = useState(colorKeys[0]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const variant = product.colorVariants[selectedColor];

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!selectedSize) return;
    addItem(product, selectedColor, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 3, aspectRatio: "3/4", background: "#f5f3ef" }}>
        <img
          src={variant.img}
          alt={`${product.name} in ${variant.label}`}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Badge */}
        {product.badge && (
          <span style={{
            position: "absolute", top: 14, left: 14,
            fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "0.14em",
            textTransform: "uppercase", padding: "4px 10px",
            background: product.badge === "Limited" ? "#1a1a1a" : "rgba(255,255,255,0.92)",
            color: product.badge === "Limited" ? "#fff" : "#1a1a1a",
            backdropFilter: "blur(4px)",
          }}>
            {product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
            transform: wishlisted ? "scale(1.15)" : "scale(1)",
            transition: "transform 0.2s",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={wishlisted ? "#c0392b" : "none"}
            stroke={wishlisted ? "#c0392b" : "#555"} strokeWidth="1.8">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Size selector — slides up on hover */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(8px)",
          padding: "14px 14px 12px",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
        }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", margin: "0 0 8px" }}>
            {selectedSize ? `Size: ${selectedSize}` : "Select a size"}
          </p>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(s); }}
                style={{
                  flex: 1, padding: "6px 0", fontSize: 11,
                  letterSpacing: "0.06em",
                  border: selectedSize === s ? "1.5px solid #1a1a1a" : "0.5px solid #d0cdc8",
                  background: selectedSize === s ? "#1a1a1a" : "transparent",
                  color: selectedSize === s ? "#fff" : "#333",
                  cursor: "pointer", borderRadius: 2,
                  transition: "all 0.15s ease", fontFamily: "inherit",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            style={{
              width: "100%", padding: "10px 0",
              fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              background: added ? "#2d7a4f" : selectedSize ? "#1a1a1a" : "#ccc",
              color: "#fff", border: "none", cursor: selectedSize ? "pointer" : "not-allowed",
              borderRadius: 2, transition: "background 0.25s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {added ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Added to Cart
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {selectedSize ? "Add to Cart" : "Choose a Size"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ paddingTop: 14 }}>
        {/* Color swatches */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
          {colorKeys.map((ck) => {
            const cv = product.colorVariants[ck];
            return (
              <button
                key={ck}
                title={cv.label}
                onClick={() => { setSelectedColor(ck); setSelectedSize(null); }}
                style={{
                  width: selectedColor === ck ? 20 : 15,
                  height: selectedColor === ck ? 20 : 15,
                  borderRadius: "50%",
                  background: cv.hex,
                  border: selectedColor === ck ? "2px solid #888" : "1.5px solid #ddd",
                  outline: selectedColor === ck ? "2px solid rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer", transition: "all 0.2s ease", padding: 0,
                  boxShadow: cv.hex === "#f9f7f4" ? "inset 0 0 0 1px #ddd" : "none",
                }}
              />
            );
          })}
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#999", marginLeft: 2, letterSpacing: "0.04em" }}>
            {variant.label}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1a1a", letterSpacing: "0.03em" }}>
              {product.name}
            </p>
            <p style={{ margin: "3px 0 0", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#999", letterSpacing: "0.04em" }}>
              {product.sub}
            </p>
          </div>
          <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>
            ${product.price}
          </p>
        </div>
      </div>
    </div>
  );
}