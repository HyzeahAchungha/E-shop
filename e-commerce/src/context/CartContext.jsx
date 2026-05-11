import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product, colorKey, size) => {
    const variant = product.colorVariants[colorKey];
    const id = `${product.id}-${colorKey}-${size}`;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [
        ...prev,
        {
          id,
          productId: product.id,
          name: product.name,
          sub: product.sub,
          price: product.price,
          colorKey,
          colorLabel: variant.label,
          colorHex: variant.hex,
          img: variant.img,
          size,
          qty: 1,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);