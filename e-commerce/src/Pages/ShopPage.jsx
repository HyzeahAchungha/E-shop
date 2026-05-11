import { useState, useMemo } from "react";
import { products, CATEGORIES } from "../data/index";
import ProductCard from "../component/ui/ProductCard";
import { useNav } from "../context/NavContext";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 – $200", min: 100, max: 200 },
  { label: "$200 – $300", min: 200, max: 300 },
  { label: "Over $300", min: 300, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

const ALL_COLORS = [...new Set(products.flatMap((p) => Object.keys(p.colorVariants)))];

export default function ShopPage() {
  const { shopFilter, setShopFilter } = useNav();
  const [activeCategory, setActiveCategory] = useState(shopFilter || "All");
  const [activeColors, setActiveColors] = useState([]);
  const [activeSizes, setActiveSizes] = useState([]);
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [sort, setSort] = useState("featured");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const toggleColor = (c) => setActiveColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const toggleSize  = (s) => setActiveSizes ((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (activeColors.length) list = list.filter((p) => activeColors.some((c) => p.colorVariants[c]));
    if (activeSizes.length)  list = list.filter((p) => activeSizes.some((s) => p.sizes.includes(s)));
    list = list.filter((p) => p.price >= priceRange.min && p.price <= priceRange.max);

    if (sort === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "newest")     list.reverse();
    return list;
  }, [activeCategory, activeColors, activeSizes, priceRange, sort]);

  const colorMap = {};
  products.forEach((p) => Object.entries(p.colorVariants).forEach(([k, v]) => { colorMap[k] = v.hex; }));

  return (
    <div style={{ minHeight: "60vh" }}>
      {/* Shop Header */}
      <div style={{
        background: "#f7f5f1",
        padding: "52px 48px 40px",
        borderBottom: "0.5px solid #e8e5e0",
      }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#999", marginBottom: 8 }}>
          Browse
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, margin: "0 0 16px", letterSpacing: "0.04em" }}>
          Shop Collection
        </h1>
        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setShopFilter(cat); }}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "8px 20px", borderRadius: 30, cursor: "pointer",
                border: "0.5px solid",
                borderColor: activeCategory === cat ? "#1a1a1a" : "#d0cdc8",
                background: activeCategory === cat ? "#1a1a1a" : "transparent",
                color: activeCategory === cat ? "#fff" : "#888",
                transition: "all 0.2s ease",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", padding: "0 48px" }}>
        {/* ── Sidebar Filters ── */}
        <aside style={{
          width: filtersOpen ? 240 : 0,
          minWidth: filtersOpen ? 240 : 0,
          overflow: "hidden",
          transition: "width 0.3s ease, min-width 0.3s ease",
          paddingTop: 36,
          paddingRight: filtersOpen ? 40 : 0,
          borderRight: filtersOpen ? "0.5px solid #e8e5e0" : "none",
        }}>
          <div style={{ opacity: filtersOpen ? 1 : 0, transition: "opacity 0.2s" }}>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#1a1a1a", marginBottom: 20, marginTop: 0 }}>
              Filters
            </p>

            {/* Price */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 12, marginTop: 0 }}>Price</p>
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.label}
                  onClick={() => setPriceRange(r)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    fontFamily: "'Jost', sans-serif", fontSize: 12, color: priceRange.label === r.label ? "#1a1a1a" : "#888",
                    fontWeight: priceRange.label === r.label ? 500 : 400,
                    background: "none", border: "none", cursor: "pointer",
                    padding: "5px 0", letterSpacing: "0.03em",
                  }}
                >
                  {priceRange.label === r.label ? "· " : ""}{r.label}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 12, marginTop: 0 }}>Color</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ALL_COLORS.map((c) => {
                  const active = activeColors.includes(c);
                  return (
                    <button
                      key={c}
                      title={c}
                      onClick={() => toggleColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: colorMap[c] || "#ccc",
                        border: active ? "2px solid #1a1a1a" : "1.5px solid #ddd",
                        outline: active ? "3px solid rgba(0,0,0,0.1)" : "none",
                        cursor: "pointer", padding: 0, transition: "all 0.15s",
                        boxShadow: colorMap[c] === "#f9f7f4" ? "inset 0 0 0 1px #ddd" : "none",
                      }}
                    />
                  );
                })}
              </div>
              {activeColors.length > 0 && (
                <button onClick={() => setActiveColors([])} style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#aaa", background: "none", border: "none", cursor: "pointer", padding: "6px 0 0", letterSpacing: "0.06em", textDecoration: "underline" }}>
                  Clear
                </button>
              )}
            </div>

            {/* Sizes */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 12, marginTop: 0 }}>Size</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["XS","S","M","L","XL"].map((s) => {
                  const active = activeSizes.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      style={{
                        width: 40, height: 36, fontFamily: "'Jost', sans-serif", fontSize: 11,
                        border: active ? "1.5px solid #1a1a1a" : "0.5px solid #d0cdc8",
                        background: active ? "#1a1a1a" : "transparent",
                        color: active ? "#fff" : "#888",
                        cursor: "pointer", borderRadius: 2, transition: "all 0.15s",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset all */}
            {(activeColors.length || activeSizes.length || priceRange.label !== "All Prices") ? (
              <button
                onClick={() => { setActiveColors([]); setActiveSizes([]); setPriceRange(PRICE_RANGES[0]); }}
                style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#c0392b", background: "none", border: "0.5px solid #e8c4c0", cursor: "pointer", padding: "8px 14px", borderRadius: 2, letterSpacing: "0.06em", transition: "all 0.15s" }}
              >
                Reset All Filters
              </button>
            ) : null}
          </div>
        </aside>

        {/* ── Products ── */}
        <div style={{ flex: 1, paddingTop: 36, paddingLeft: filtersOpen ? 40 : 0, transition: "padding 0.3s" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "0.5px solid #d0cdc8", cursor: "pointer", padding: "8px 14px", borderRadius: 2 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                </svg>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#555", letterSpacing: "0.08em" }}>
                  {filtersOpen ? "Hide" : "Show"} Filters
                </span>
              </button>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aaa", letterSpacing: "0.04em" }}>
                {filtered.length} {filtered.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.06em",
                border: "0.5px solid #d0cdc8", background: "#fff", color: "#555",
                padding: "8px 14px", cursor: "pointer", outline: "none", borderRadius: 2,
              }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#aaa" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: "italic" }}>No items match your filters</p>
              <button onClick={() => { setActiveCategory("All"); setActiveColors([]); setActiveSizes([]); setPriceRange(PRICE_RANGES[0]); }} className="btn-primary" style={{ marginTop: 20 }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, paddingBottom: 80 }}>
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}