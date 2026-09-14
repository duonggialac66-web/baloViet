"use client";

import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
  colorHex: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; color: string; colorHex: string } }
  | { type: "REMOVE_ITEM"; payload: { productId: string; color: string } }
  | { type: "UPDATE_QTY"; payload: { productId: string; color: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.findIndex(
        (i) => i.product.id === action.payload.product.id && i.color === action.payload.color
      );
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = {
          ...items[existing],
          quantity: items[existing].quantity + action.payload.quantity,
        };
        return { ...state, items, isOpen: true };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        isOpen: true,
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.product.id === action.payload.productId && i.color === action.payload.color)
        ),
      };
    case "UPDATE_QTY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.product.id === action.payload.productId && i.color === action.payload.color)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.payload.productId && i.color === action.payload.color
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN_DRAWER":
      return { ...state, isOpen: true };
    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

const STORAGE_KEY = "baloviet_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  discountText: string;
  discountType: "percentage" | "fixed" | "freeship";
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  coupon: AppliedCoupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  addItem: (product: Product, quantity: number, color: string, colorHex: string) => void;
  removeItem: (productId: string, color: string) => void;
  updateQty: (productId: string, color: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage after hydration (client-only)
  useEffect(() => {
    const saved = loadCart();
    if (saved.length > 0) {
      for (const item of saved) {
        dispatch({ type: "ADD_ITEM", payload: item });
      }
    }
    try {
      const savedCoupon = localStorage.getItem("baloviet_coupon");
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage only after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    }
  }, [state.items, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      if (coupon) {
        localStorage.setItem("baloviet_coupon", JSON.stringify(coupon));
      } else {
        localStorage.removeItem("baloviet_coupon");
      }
    }
  }, [coupon, isHydrated]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, i) => sum + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );

  // Re-calculate coupon discount if totalPrice changes
  useEffect(() => {
    if (coupon && totalPrice > 0) {
      fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.code, subtotal: totalPrice }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setCoupon({
              code: data.code,
              discountAmount: data.discountAmount,
              discountText: data.discountText,
              discountType: data.discountType,
            });
          } else {
            setCoupon(null);
          }
        })
        .catch(() => {});
    } else if (totalPrice === 0) {
      setCoupon(null);
    }
  }, [totalPrice]);

  const applyCoupon = async (codeStr: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeStr, subtotal: totalPrice }),
      });
      const data = await res.json();
      if (data.valid) {
        const newCoupon: AppliedCoupon = {
          code: data.code,
          discountAmount: data.discountAmount,
          discountText: data.discountText,
          discountType: data.discountType,
        };
        setCoupon(newCoupon);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || "Mã không hợp lệ" };
      }
    } catch (err) {
      return { success: false, message: "Lỗi kết nối khi kiểm tra mã" };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const discountAmount = coupon ? coupon.discountAmount : 0;

  const value: CartContextValue = {
    items: state.items,
    isOpen: state.isOpen,
    totalItems,
    totalPrice,
    coupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    addItem: (product, quantity, color, colorHex) =>
      dispatch({ type: "ADD_ITEM", payload: { product, quantity, color, colorHex } }),
    removeItem: (productId, color) =>
      dispatch({ type: "REMOVE_ITEM", payload: { productId, color } }),
    updateQty: (productId, color, quantity) =>
      dispatch({ type: "UPDATE_QTY", payload: { productId, color, quantity } }),
    clear: () => {
      dispatch({ type: "CLEAR" });
      setCoupon(null);
    },
    openDrawer: () => dispatch({ type: "OPEN_DRAWER" }),
    closeDrawer: () => dispatch({ type: "CLOSE_DRAWER" }),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// Toast context
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
