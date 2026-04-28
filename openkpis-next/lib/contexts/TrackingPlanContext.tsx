'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PlanItem = {
  id: string;
  type: 'kpi' | 'metric' | 'dimension' | 'event';
  name: string;
};

interface TrackingPlanContextType {
  cart: PlanItem[];
  addToCart: (item: PlanItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isItemInCart: (id: string) => boolean;
}

const TrackingPlanContext = createContext<TrackingPlanContextType | undefined>(undefined);

export function TrackingPlanProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<PlanItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('openkpis_tracking_plan_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse tracking plan cart from local storage', e);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('openkpis_tracking_plan_cart', JSON.stringify(cart));
  }, [cart, mounted]);

  const addToCart = (item: PlanItem) => {
    setCart((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isItemInCart = (id: string) => {
    return cart.some((i) => i.id === id);
  };

  return (
    <TrackingPlanContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isItemInCart }}>
      {children}
    </TrackingPlanContext.Provider>
  );
}

export function useTrackingPlan() {
  const context = useContext(TrackingPlanContext);
  if (context === undefined) {
    throw new Error('useTrackingPlan must be used within a TrackingPlanProvider');
  }
  return context;
}
