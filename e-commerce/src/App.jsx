import { CartProvider } from "./context/CartContext";
import { NavProvider, useNav } from "./context/NavContext";
import AnnouncementBar from "./component/layout/AnnouncementBar";
import Navbar from "./component/Layout/Navbar";
import Footer from "./component/layout/Footer";
import CartSidebar from "./component/ui/Cartsidebar"
import HomePage from "./Pages/HomePage";
import ShopPage from "./Pages/ShopPage";
import CheckoutPage from "./Pages/Checkoutpage";
import { globalStyles } from "./styles/globals";

function AppContent() {
  const { page } = useNav();

  const isCheckout = page === "checkout";

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <style>{globalStyles}</style>

      {!isCheckout && <AnnouncementBar />}
      {!isCheckout && <Navbar />}

      <main>
        {page === "home"     && <HomePage />}
        {page === "shop"     && <ShopPage />}
        {page === "checkout" && <CheckoutPage/>}
      </main>

      {!isCheckout && <Footer />}
      <CartSidebar />
    </div>
  );
}

export default function App() {
  return (
    <NavProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </NavProvider>
  );
}