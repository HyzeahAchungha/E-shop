export default function AnnouncementBar({ message = "Enjoy Free Shipping On All Orders" }) {
  return (
    <div
      style={{
        background: "#1a1a1a",
        color: "#fff",
        textAlign: "center",
        padding: "9px 16px",
        fontFamily: "'Jost', sans-serif",
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {message}
    </div>
  );
}