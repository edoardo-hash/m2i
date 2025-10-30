// pages/index.tsx
"use client";

import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { availability, eur0, monthlyFromVilla, toNum } from "../lib/pricing";

export default function Home() {
  const [villas, setVillas] = useState<any[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [budgetRaw, setBudgetRaw] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);

  // Fetch villas & unique locations
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/invenio/villas");
      const data = await res.json();
      const list = data?.villas || data || [];
      setVillas(list);
      const locs = Array.from(
        new Set(
          list
            .map((v: any) => v.location || v.city || v.destination)
            .filter(Boolean)
            .map((x: string) => x.trim())
        )
      ).sort((a, b) => a.localeCompare(b));
      setLocations(locs);
    })();
  }, []);

  // Debounce budget parsing
  const [budget, setBudget] = useState<number | undefined>();
  useEffect(() => {
    const id = setTimeout(() => {
      const n = Number(budgetRaw.replace(/[^\d.]/g, ""));
      setBudget(Number.isFinite(n) && n > 0 ? n : undefined);
    }, 250);
    return () => clearTimeout(id);
  }, [budgetRaw]);

  // Show About when URL hash is #about
  useEffect(() => {
    const applyHash = () => {
      const wantAbout = window.location.hash.toLowerCase() === "#about";
      setShowAbout(wantAbout);
      if (wantAbout && aboutRef.current) {
        aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Filtered villas
  const filtered = useMemo(() => {
    return villas.filter((v) => {
      if (selectedLocation) {
        const loc = (v.location || v.city || v.destination || "").trim();
        if (loc !== selectedLocation) return false;
      }
      if (budget) {
        const m = monthlyFromVilla(v);
        if (!m || m > budget) return false;
      }
      return true;
    });
  }, [villas, selectedLocation, budget]);

  // Handlers
  const openAbout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowAbout(true);
    // update hash for deep link
    const url = new URL(window.location.href);
    url.hash = "about";
    window.history.replaceState({}, "", url.toString());
    setTimeout(() => {
      if (aboutRef.current) aboutRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <>
      <Head>
        <title>Move2Ibiza — Long-term & Seasonal Rentals</title>
      </Head>

      {/* HERO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center bg-black">
        <Image
          src="/es-vedra-hero.jpg"
          alt="Ibiza luxury villas"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 text-white">
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold">
            Luxury long-term & seasonal rentals in Ibiza
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Curated villas for a refined island lifestyle.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#grid"
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-slate-900"
              style={{ background: "#C6A36C" }}
            >
              Explore properties
            </a>
            <a
              href="#about"
              onClick={openAbout}
              className="inline-flex items-center rounded-full px-6 py-3 ring-1 ring-white/30 text-white"
            >
              About us
            </a>
          </div>
        </div>
      </section>

      {/* SEARCH (directly under hero) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12" id="grid">
        <form className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" onSubmit={(e) => e.preventDefault()}>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            aria-label="Location"
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <input
            inputMode="numeric"
            placeholder="Monthly budget (€)"
            value={budgetRaw}
            onChange={(e) => setBudgetRaw(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            aria-label="Monthly budget"
          />

          <button
            type="submit"
            className="rounded-xl bg-[#C6A36C] px-4 py-3 font-semibold text-slate-900"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => {
            const m = monthlyFromVilla(v);
            const { hasWinter, hasSummer, hasAnnual } = availability(v);
            return (
              <div
                key={v.id || v.slug}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                <img
                  src={v.cover || v.image || "/placeholder.jpg"}
                  alt={v.title}
                  className="h-56 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold text-slate-900">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {v.location || v.city || v.destination}
                  </p>

                  {typeof m === "number" && (
                    <p className="mt-2 font-medium text-[#C6A36C]">
                      from {eur0(m)} / month
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {hasWinter && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1 ring-1 ring-slate-200">
                        Winter (6 mo)
                      </span>
                    )}
                    {hasSummer && (
                      <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1 ring-1 ring-slate-200">
                        Summer (6 mo)
                      </span>
                    )}
                    {hasAnnual && (
                      <span className="inline-flex items-center rounded-full bg-slate-900 text-white text-xs px-3 py-1">
                        Yearly
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT (hidden until requested) */}
      <section
        id="about"
        ref={aboutRef as any}
        className={`mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 transition-opacity duration-200 ${showAbout ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"}`}
        aria-hidden={showAbout ? "false" : "true"}
      >
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">
          About us
        </h2>
        <p className="mt-4 text-slate-700 leading-relaxed">
          Move2Ibiza curates long-term and seasonal rentals across Ibiza for clients who value
          privacy, comfort, and great locations. We hand-pick homes that reflect true island
          living, with reliable internet, generous outdoor areas, and concierge-level support.
          Our team lives year-round on the island, ensuring every stay feels effortless and
          authentic.
        </p>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">
          Contact us
        </h2>
        <form className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
          <input name="name" placeholder="Name" className="rounded-xl border border-slate-200 px-4 py-3" required />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3" required />
          <input name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <textarea name="message" rows={5} placeholder="Message" className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" required />
          <button type="submit" className="mt-2 w-fit rounded-full px-5 py-3 font-semibold" style={{ background: "#C6A36C", color: "#1f2937" }}>
            Send inquiry
          </button>
        </form>
      </section>
    </>
  );
}