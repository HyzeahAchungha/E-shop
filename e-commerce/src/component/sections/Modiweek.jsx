import ModiweekCard from "../ui/ModiweekCard";
import { modiweekItems } from "../../data/index";

export default function Modiweek() {
  return (
    <section style={{ padding: "72px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 8 }}>Daily Inspiration</p>
          <h2 className="section-title" style={{ margin: 0 }}>Modiweek</h2>
        </div>
        <a className="nav-link" style={{ fontSize: 11, textDecoration: "underline", textUnderlineOffset: 3 }}>
          View All
        </a>
      </div>

      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
        {modiweekItems.map((item) => (
          <ModiweekCard key={item.day} item={item} />
        ))}
      </div>
    </section>
  );
}