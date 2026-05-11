import ProductCard from "../ui/ProductCard";
import { bestSellers } from "../../data/index";

export default function BestSellers() {
  return (
    <section style={{ padding: "80px 48px 72px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Curated For You</p>
          <h2 className="section-title" style={{ margin: 0 }}>Best Sellers</h2>
        </div>
        <a className="nav-link" style={{ fontSize: 11, textDecoration: "underline", textUnderlineOffset: 3 }}>
          View All
        </a>
      </div>

      <div
        style={{
          background: "#f7f5f1",
          borderLeft: "3px solid #1a1a1a",
          padding: "12px 20px",
          marginBottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
        </svg>
        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#666", letterSpacing: "0.04em" }}>
          Click a color swatch to see the garment in that color
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
        {bestSellers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}