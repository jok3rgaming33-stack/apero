"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AgeContextValue {
  ageVerified: boolean;
  verify: () => void;
  refuse: () => void;
}

const AgeContext = createContext<AgeContextValue | null>(null);

export function AgeProvider({ children }: { children: ReactNode }) {
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("aperomaison-age-verified");
    setAgeVerified(stored === "true");
    setChecked(true);
  }, []);

  const verify = () => {
    sessionStorage.setItem("aperomaison-age-verified", "true");
    setAgeVerified(true);
  };

  const refuse = () => {
    sessionStorage.removeItem("aperomaison-age-verified");
    setAgeVerified(false);
  };

  if (!checked) return null;

  return (
    <AgeContext.Provider value={{ ageVerified, verify, refuse }}>
      {children}
    </AgeContext.Provider>
  );
}

export function useAge() {
  const ctx = useContext(AgeContext);
  if (!ctx) throw new Error("useAge must be used within AgeProvider");
  return ctx;
}
