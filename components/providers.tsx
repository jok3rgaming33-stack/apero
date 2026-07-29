"use client";

import { CartProvider } from "@/lib/cart-context";
import { AgeProvider } from "@/lib/age-context";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AgeProvider>
      <CartProvider>{children}</CartProvider>
    </AgeProvider>
  );
}
