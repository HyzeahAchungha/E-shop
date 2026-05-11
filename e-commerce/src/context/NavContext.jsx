import { createContext, useContext, useState } from "react";

const NavContext = createContext(null);

// pages: "home" | "shop" | "checkout"
export function NavProvider({ children }) {
  const [page, setPage] = useState("home");
  const [shopFilter, setShopFilter] = useState("All");

  const goTo = (p, filter = "All") => {
    setPage(p);
    if (filter) setShopFilter(filter);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <NavContext.Provider value={{ page, goTo, shopFilter, setShopFilter }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);