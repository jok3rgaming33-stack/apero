"use client";

import { type ReactNode } from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import AgeGate from "./age-gate";

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AgeGate />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
