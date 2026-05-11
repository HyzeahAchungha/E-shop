import { collectionItems } from "../../data/index";

export default function Collection() {
  return (
    <section style={{ padding: "72px 48px" }}>
      <p className="section-label" style={{ marginBottom: 8 }}>Explore</p>
      <h2 className="section-title">Collection</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "280px 280px",
          gap: 3,
        }}
      >
        {/* Blouses — spans full height */}
        <div className="coll-item" style={{ gridRow: "1 / 3" }}>
          <img src={collectionItems[0].img} alt="Blouses" style={{ height: "100%" }} />
          <div className="coll-overlay">
            <span className="coll-label">Blouses</span>
          </div>
        </div>

        {/* Pants */}
        <div className="coll-item">
          <img src={collectionItems[1].img} alt="Pants" />
          <div className="coll-overlay">
            <span className="coll-label">Pants</span>
          </div>
        </div>

        {/* Dresses + Outwear side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <div className="coll-item">
            <img src={collectionItems[2].img} alt="Dresses" />
            <div className="coll-overlay">
              <span className="coll-label">Dresses</span>
            </div>
          </div>
          <div className="coll-item">
            <img src={collectionItems[3].img} alt="Outwear" />
            <div className="coll-overlay">
              <span className="coll-label">Outwear</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}