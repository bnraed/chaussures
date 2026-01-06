import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x._id === item._id && x.size === item.size);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          quantity: Math.min(10, (copy[idx].quantity || 1) + (item.quantity || 1)),
        };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart((prev) => prev.filter((x) => !(x._id === id && x.size === size)));
  };

  const clearCart = () => setCart([]);

  const total = useMemo(
    () => cart.reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.quantity) || 0), 0),
    [cart]
  );

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
