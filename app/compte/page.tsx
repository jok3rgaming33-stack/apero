"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Mail, Eye, EyeOff, Gift, Star, Zap, Crown } from "lucide-react";
import { LOYALTY_TIERS } from "@/lib/data";

type Tab = "login" | "register";

const TIER_ICONS = [Star, Zap, Gift, Crown];

export default function ComptePage() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    prenom: "",
    nom: "",
    confirmPassword: "",
    acceptCGV: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — auth backend integration to be wired later
    alert("Connexion simulée — intégration backend à venir.");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Inscription simulée — intégration backend à venir.");
  };

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: auth form */}
          <div>
            {/* Tabs */}
            <div
              className="flex rounded-xl p-1 mb-8"
              style={{ background: "#1a1208", border: "1px solid #2e2010" }}
            >
              {(["login", "register"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: tab === t ? "#f5c518" : "transparent",
                    color: tab === t ? "#0f0b07" : "#a89272",
                  }}
                >
                  {t === "login" ? "Se connecter" : "Créer un compte"}
                </button>
              ))}
            </div>

            {/* Guest note */}
            <div
              className="rounded-xl px-4 py-3 mb-6 text-sm"
              style={{ background: "rgba(245,197,24,0.07)", border: "1px solid rgba(245,197,24,0.18)", color: "#c4a882" }}
            >
              <strong style={{ color: "#f5c518" }}>Pas obligatoire.</strong>{" "}
              Tu peux commander sans compte. Le compte sert uniquement à activer
              le programme fidélité et retrouver tes commandes.
            </div>

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b5540" }} />
                    <input
                      type="email"
                      required
                      placeholder="jean@email.fr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b5540" }} />
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#6b5540" }}
                      aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 mt-2"
                  style={{ background: "#f5c518", color: "#0f0b07" }}
                >
                  Se connecter
                </button>
                <p className="text-center text-sm" style={{ color: "#6b5540" }}>
                  <button type="button" className="underline" style={{ color: "#a89272" }}>
                    Mot de passe oublié ?
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "prenom", label: "Prénom", placeholder: "Jean" },
                    { key: "nom", label: "Nom", placeholder: "Dupont" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                        {label}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={placeholder}
                        value={form[key as "prenom" | "nom"]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b5540" }} />
                    <input
                      type="email"
                      required
                      placeholder="jean@email.fr"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#6b5540" }} />
                    <input
                      type={showPwd ? "text" : "password"}
                      required
                      placeholder="Minimum 8 caractères"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-9 pr-10 py-3 rounded-xl text-sm outline-none"
                      style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#6b5540" }}
                      aria-label={showPwd ? "Masquer" : "Afficher"}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.acceptCGV}
                      onChange={(e) => setForm({ ...form, acceptCGV: e.target.checked })}
                      className="mt-0.5 rounded"
                      style={{ accentColor: "#f5c518" }}
                    />
                    <span className="text-xs leading-relaxed" style={{ color: "#a89272" }}>
                      J&apos;ai lu et j&apos;accepte les{" "}
                      <Link href="#" className="underline" style={{ color: "#f5c518" }}>
                        CGV
                      </Link>{" "}
                      et la{" "}
                      <Link href="#" className="underline" style={{ color: "#f5c518" }}>
                        politique de confidentialité
                      </Link>
                      . Je confirme avoir 18 ans ou plus.
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={!form.acceptCGV}
                  className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 mt-2 disabled:opacity-40"
                  style={{ background: "#f5c518", color: "#0f0b07" }}
                >
                  Créer mon compte
                </button>
              </form>
            )}

            {/* Guest CTA */}
            <div className="mt-8 text-center">
              <p className="text-sm mb-3" style={{ color: "#6b5540" }}>
                ou
              </p>
              <Link
                href="/aperos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: "#2e2010", color: "#a89272" }}
              >
                <User className="w-4 h-4" />
                Commander sans compte
              </Link>
            </div>
          </div>

          {/* Right: loyalty program */}
          <div>
            <div
              className="rounded-2xl p-6 border"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" style={{ color: "#f5c518" }} />
                <span className="font-bold text-foreground">Programme fidélité</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "#a89272" }}>
                1 € dépensé = 1 point. Monte en grade et débloque des avantages exclusifs.
              </p>

              <div className="flex flex-col gap-3">
                {LOYALTY_TIERS.map((tier, i) => {
                  const Icon = TIER_ICONS[i];
                  return (
                    <div
                      key={tier.name}
                      className="flex gap-4 items-start p-4 rounded-xl border"
                      style={{ background: "#0f0b07", borderColor: "#2e2010" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${tier.color}22`, border: `1.5px solid ${tier.color}55` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: tier.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-foreground">{tier.name}</span>
                          <span className="text-xs" style={{ color: "#6b5540" }}>
                            {tier.maxPoints === Infinity
                              ? `${tier.minPoints}+ pts`
                              : `${tier.minPoints}–${tier.maxPoints} pts`}
                          </span>
                        </div>
                        <ul className="flex flex-col gap-0.5">
                          {tier.perks.map((perk) => (
                            <li key={perk} className="text-xs" style={{ color: "#a89272" }}>
                              • {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
