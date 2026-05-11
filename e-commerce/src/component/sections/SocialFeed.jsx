import { socialImgs } from "../../data/index";

export default function SocialFeed() {
  return (
    <section style={{ padding: "72px 48px" }}>
      <p className="section-label" style={{ marginBottom: 8, textAlign: "center" }}>Community</p>
      <h2 className="section-title" style={{ textAlign: "center" }}>Follow Us @Modimal</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 3,
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        {socialImgs.map((img, i) => (
          <div key={i} style={{ overflow: "hidden" }}>
            <img src={img} alt={`Social post ${i + 1}`} className="social-img" />
          </div>
        ))}
      </div>
    </section>
  );
}