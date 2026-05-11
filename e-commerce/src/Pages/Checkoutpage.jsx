import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNav } from "../context/NavContext";

const steps = ["Shipping", "Payment", "Review"];

function Input({ label, type = "text", value, onChange, placeholder, half }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#1a1a1a",
          border: "none", borderBottom: `1.5px solid ${focused ? "#1a1a1a" : "#e0ddd8"}`,
          padding: "10px 0", outline: "none", background: "transparent",
          transition: "border-color 0.2s", letterSpacing: "0.02em",
        }}
      />
    </div>
  );
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 48 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: i < current ? "#1a1a1a" : i === current ? "#1a1a1a" : "transparent",
              border: i <= current ? "none" : "1px solid #d0cdc8",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: i === current ? "#fff" : "#ccc" }}>{i + 1}</span>
              )}
            </div>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: i <= current ? "#1a1a1a" : "#aaa" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 80, height: 1, background: i < current ? "#1a1a1a" : "#e0ddd8", margin: "0 12px 22px" }} />
          )}
        </div>
      ))}
    </div>
  );
}


export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { goTo } = useNav();
  const [step, setStep] = useState(0);
  const [placed, setPlaced] = useState(false);

  const [shipping, setShipping] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "", zip: "", country: "" });
  const [payment, setPayment] = useState({ card: "", name: "", expiry: "", cvv: "" });

  const setS = (k) => (e) => setShipping((p) => ({ ...p, [k]: e.target.value }));
  const setP = (k) => (e) => setPayment((p) => ({ ...p, [k]: e.target.value }));

  const shipping_total = 0;
  const tax = Math.round(total * 0.08);
  const order_total = total + tax;

  const handlePlaceOrder = () => {
    setPlaced(true);
    clearCart();
  };

  if (placed) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 48px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0f7f3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300, fontStyle: "italic", margin: "0 0 12px", letterSpacing: "0.04em" }}>
          Order Confirmed
        </h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#888", marginBottom: 8, letterSpacing: "0.04em" }}>
          Thank you, {shipping.firstName || "dear customer"}!
        </p>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aaa", maxWidth: 360, lineHeight: 1.8, marginBottom: 40 }}>
          Your order has been placed and a confirmation will be sent to {shipping.email || "your email"}.
          We'll notify you when it ships.
        </p>
        <button className="btn-primary" onClick={() => goTo("home")}>Return Home</button>
        <button onClick={() => goTo("shop")} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 14, fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aaa", textDecoration: "underline", letterSpacing: "0.06em" }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", background: "#faf9f7" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #e8e5e0", padding: "20px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => goTo("home")} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, letterSpacing: "0.18em", textTransform: "lowercase" }}>
          modimal<span style={{ fontSize: 7, verticalAlign: "super" }}>®</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#888", letterSpacing: "0.08em" }}>Secure Checkout</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 60 }}>

        {/* ── Left: Form ── */}
        <div>
          <StepIndicator current={step} />

          {/* Step 0: Shipping */}
          {step === 0 && (
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, margin: "0 0 32px", letterSpacing: "0.04em" }}>
                Shipping Information
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                <Input label="First Name" value={shipping.firstName} onChange={setS("firstName")} half />
                <Input label="Last Name"  value={shipping.lastName}  onChange={setS("lastName")}  half />
                <Input label="Email Address" type="email" value={shipping.email} onChange={setS("email")} placeholder="you@example.com" />
                <Input label="Phone" type="tel" value={shipping.phone} onChange={setS("phone")} placeholder="+1 (000) 000-0000" />
                <Input label="Street Address" value={shipping.address} onChange={setS("address")} placeholder="123 Main Street, Apt 4B" />
                <Input label="City"    value={shipping.city}    onChange={setS("city")}    half />
                <Input label="ZIP / Postal" value={shipping.zip} onChange={setS("zip")} half />
                <Input label="Country" value={shipping.country} onChange={setS("country")} placeholder="United States" />
              </div>

              {/* Shipping methods */}
              <div style={{ marginTop: 36 }}>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 14 }}>Delivery Method</p>
                {[
                  { label: "Standard Shipping", time: "5–7 business days", price: "Free" },
                  { label: "Express Shipping",  time: "2–3 business days", price: "$12.00" },
                  { label: "Overnight",         time: "Next business day",  price: "$28.00" },
                ].map((m, i) => (
                  <label key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", marginBottom: 8, border: `0.5px solid ${i === 0 ? "#1a1a1a" : "#e0ddd8"}`, borderRadius: 3, cursor: "pointer", background: i === 0 ? "#faf9f7" : "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${i === 0 ? "#1a1a1a" : "#d0cdc8"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {i === 0 && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1a1a1a" }} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#1a1a1a", fontWeight: i === 0 ? 500 : 400 }}>{m.label}</p>
                        <p style={{ margin: "2px 0 0", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#aaa" }}>{m.time}</p>
                      </div>
                    </div>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: i === 0 ? "#2d7a4f" : "#888" }}>{m.price}</span>
                  </label>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="btn-dark" style={{ marginTop: 32, padding: "14px 40px" }}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, margin: "0 0 32px", letterSpacing: "0.04em" }}>
                Payment Details
              </h3>

              {/* Card type icons */}
              <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                {["VISA", "MC", "AMEX", "PP"].map((c) => (
                  <div key={c} style={{ padding: "6px 12px", border: "0.5px solid #e0ddd8", borderRadius: 4, fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.08em", color: "#999" }}>{c}</div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                <Input label="Card Number" value={payment.card} onChange={setP("card")} placeholder="0000 0000 0000 0000" />
                <Input label="Cardholder Name" value={payment.name} onChange={setP("name")} />
                <Input label="Expiry Date" value={payment.expiry} onChange={setP("expiry")} placeholder="MM / YY" half />
                <Input label="CVV" type="password" value={payment.cvv} onChange={setP("cvv")} placeholder="•••" half />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, padding: "12px 16px", background: "#f7f5f1", borderRadius: 3 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#666", letterSpacing: "0.04em" }}>
                  Your payment info is encrypted and secure
                </span>
              </div>

              <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
                <button onClick={() => setStep(0)} style={{ padding: "14px 28px", background: "transparent", border: "0.5px solid #d0cdc8", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", borderRadius: 2 }}>
                  Back
                </button>
                <button onClick={() => setStep(2)} className="btn-dark" style={{ padding: "14px 40px" }}>
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, margin: "0 0 32px", letterSpacing: "0.04em" }}>
                Review Your Order
              </h3>

              {/* Summary cards */}
              {[
                { title: "Ships to", lines: [`${shipping.firstName} ${shipping.lastName}`, shipping.address, `${shipping.city} ${shipping.zip}`, shipping.country], step: 0 },
                { title: "Payment", lines: [`•••• •••• •••• ${payment.card.slice(-4) || "0000"}`, payment.name], step: 1 },
              ].map((s) => (
                <div key={s.title} style={{ border: "0.5px solid #e8e5e0", borderRadius: 3, padding: "16px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 8px", fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>{s.title}</p>
                    {s.lines.map((l, i) => l && (
                      <p key={i} style={{ margin: i === 0 ? "0 0 2px" : "2px 0", fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#555" }}>{l}</p>
                    ))}
                  </div>
                  <button onClick={() => setStep(s.step)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#aaa", textDecoration: "underline", letterSpacing: "0.04em" }}>Edit</button>
                </div>
              ))}

              <div style={{ display: "flex", gap: 14, marginTop: 32 }}>
                <button onClick={() => setStep(1)} style={{ padding: "14px 28px", background: "transparent", border: "0.5px solid #d0cdc8", cursor: "pointer", fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#888", borderRadius: 2 }}>
                  Back
                </button>
                <button onClick={handlePlaceOrder} className="btn-dark" style={{ flex: 1, padding: "14px 0" }}>
                  Place Order · ${order_total.toLocaleString()}
                </button>
              </div>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#bbb", marginTop: 14, lineHeight: 1.7, letterSpacing: "0.03em" }}>
                By placing this order you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div style={{ position: "sticky", top: 90, alignSelf: "flex-start" }}>
          <div style={{ background: "#fff", border: "0.5px solid #e8e5e0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "0.5px solid #f0ede8" }}>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
                Order Summary
              </p>
            </div>
            <div style={{ padding: "20px 24px", maxHeight: 340, overflowY: "auto" }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 60, height: 72, borderRadius: 3, overflow: "hidden", background: "#f5f3ef" }}>
                      <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <span style={{ position: "absolute", top: -6, right: -6, background: "#888", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Jost', sans-serif", fontSize: 9 }}>
                      {item.qty}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#1a1a1a", fontWeight: 500 }}>{item.name}</p>
                    <p style={{ margin: "3px 0", fontFamily: "'Jost', sans-serif", fontSize: 11, color: "#aaa" }}>
                      {item.colorLabel} · {item.size}
                    </p>
                    <p style={{ margin: 0, fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#555" }}>
                      ${(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 24px", borderTop: "0.5px solid #f0ede8" }}>
              {[
                { label: "Subtotal", value: `$${total.toLocaleString()}` },
                { label: "Shipping", value: "Free", green: true },
                { label: "Tax (8%)", value: `$${tax.toLocaleString()}` },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: "#aaa", letterSpacing: "0.03em" }}>{r.label}</span>
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: r.green ? "#2d7a4f" : "#555" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "0.5px solid #f0ede8", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: "#1a1a1a", fontWeight: 500, letterSpacing: "0.03em" }}>Total</span>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 15, color: "#1a1a1a", fontWeight: 500 }}>${order_total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}