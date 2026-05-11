import { useCart } from "../../context/CartContext";
import { useNav } from "../../context/NavContext";

export default function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, count } = useCart();
  const { goTo } = useNav();

  const handleCheckout = () => {
    setIsOpen(false);
    goTo("checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 199,
          background: "rgba(0,0,0,0.35)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.35s ease",
          backdropFilter: isOpen ? "blur(2px)" : "none",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 200,
        width: 420, background: "#fff",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94)",
        display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.1)",
      }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "0.5px solid #e8e5e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, letterSpacing: "0.04em" }}>
              Your Cart
            </h2>
            <p style={{ margin: "2px 0 0", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#999", letterSpacing: "0.08em" }}>
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 80 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" style={{ marginBottom: 16 }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#aaa", fontStyle: "italic" }}>
                Your cart is empty
              </p>
              <button
                onClick={() => { setIsOpen(false); goTo("shop"); }}
                className="btn-primary"
                style={{ marginTop: 20 }}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 14, paddingBottom: 20, borderBottom: "0.5px solid #f0ede8" }}>
                  {/* Image */}
                  <div style={{ width: 86, height: 110, borderRadius: 3, overflow: "hidden", flexShrink: 0, background: "#f5f3ef" }}>
                    <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                        {item.name}
                      </p>
                      <p style={{ margin: "3px 0", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#999" }}>
                        {item.sub}
                      </p>
                      {/* Color + size tags */}
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#888", letterSpacing: "0.06em", background: "#f5f3ef", padding: "3px 8px", borderRadius: 20 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.colorHex, display: "inline-block", border: "0.5px solid rgba(0,0,0,0.12)" }} />
                          {item.colorLabel}
                        </span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#888", letterSpacing: "0.06em", background: "#f5f3ef", padding: "3px 8px", borderRadius: 20 }}>
                          {item.size}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      {/* Qty controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: 0, border: "0.5px solid #e0ddd8", borderRadius: 3 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ width: 28, textAlign: "center", fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#1a1a1a" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, +1)} style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#555", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                          ${(item.price * item.qty).toLocaleString()}
                        </span>
                        <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#bbb" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "20px 28px 32px", borderTop: "0.5px solid #e8e5e0" }}>
            {/* Shipping note */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f7f5f1", padding: "10px 14px", borderRadius: 3, marginBottom: 16 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#555", letterSpacing: "0.04em" }}>
                Free shipping on all orders
              </span>
            </div>

            {/* Subtotal */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#888", letterSpacing: "0.04em" }}>Subtotal</span>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>${total.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#888", letterSpacing: "0.04em" }}>Shipping</span>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#2d7a4f", letterSpacing: "0.04em" }}>Free</span>
            </div>

            <button
              onClick={handleCheckout}
              style={{
                width: "100%", padding: "15px 0",
                background: "#1a1a1a", color: "#fff", border: "none", cursor: "pointer",
                fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
                borderRadius: 2, transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#333"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#1a1a1a"}
            >
              Checkout · ${total.toLocaleString()}
            </button>
            <button
              onClick={() => { setIsOpen(false); goTo("shop"); }}
              style={{
                width: "100%", padding: "12px 0", marginTop: 10,
                background: "transparent", color: "#888", border: "none", cursor: "pointer",
                fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.1em",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}