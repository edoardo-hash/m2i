// pages/v/[slug].tsx
"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

/* =========================
   Types (loose to accept your API)
========================= */
type VillaAPI = {
  slug?: string;
  title?: string;
  location?: string;
  city?: string;
  destination?: string;
  description?: string;
  mapQuery?: string;
  cover?: string;
  images?: string[];
  photos?: Array<{ url?: string; src?: string }>;
  gallery?: Array<{ url?: string; src?: string }>;
  meta?: {
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    builtSize?: string | number;
    plotSize?: string | number;
    prices?: {
      monthly?: string;
      annual?: string;
      summer?: string;
      winter?: string;
    };
  };
};

const BRAND = "#1B3A4B";
const ACCENT = "#C6A36C";
const HEADER = 72;

/* =========================
   Helpers
========================= */
function extractImages(v: VillaAPI): string[] {
  const fromStrings = v.images ?? [];
  const fromPhotos = (v.photos ?? [])
    .map((p) => p.url || p.src)
    .filter(Boolean) as string[];
  const fromGallery = (v.gallery ?? [])
    .map((p) => p.url || p.src)
    .filter(Boolean) as string[];

  const list = [
    ...(v.cover ? [v.cover] : []),
    ...fromStrings,
    ...fromPhotos,
    ...fromGallery,
  ].filter(Boolean);

  // de-dupe in order
  const seen = new Set<string>();
  const uniq = list.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  // Prefer reasonably large images (skip tiny thumbs when URLs carry w/h)
  return uniq.filter((u) => {
    try {
      const url = new URL(u);
      const w = url.searchParams.get("w") || url.searchParams.get("width");
      const h = url.searchParams.get("h") || url.searchParams.get("height");
      if (!w && !h) return true;
      const W = w ? parseInt(w, 10) : 9999;
      const H = h ? parseInt(h, 10) : 9999;
      return W >= 900 || H >= 600;
    } catch {
      return true;
    }
  });
}

/* =========================
   Page
========================= */
export default function VillaPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [villa, setVilla] = useState<VillaAPI | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Description" | "Features" | "Location" | "Gallery"
  >("Description");

  // Load real data
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/invenio/villa?slug=${encodeURIComponent(String(slug))}`
        );
        const data = await res.json();
        const v: VillaAPI | null = data?.villa || null;
        if (!v) return;

        const imgs = extractImages(v);
        setVilla(v);
        setImages(imgs.length ? imgs : v.cover ? [v.cover] : []);
        setIdx(0);
      } catch (e) {
        console.error("Villa fetch error", e);
      }
    })();
  }, [slug]);

  // Header scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard nav for hero
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!images.length) return;
      if (e.key === "ArrowLeft")
        setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length]);

  const title = villa?.title || "Villa";
  const bedrooms = villa?.meta?.bedrooms ?? "—";
  const bathrooms = villa?.meta?.bathrooms ?? "—";
  const guests = villa?.meta?.guests ?? "—";
  const location = villa?.location || villa?.city || "Ibiza";
  const priceMonthly = villa?.meta?.prices?.monthly || "Contact us";

  const metaLine = `${location} · ${bedrooms} Bedrooms · ${bathrooms} Bathrooms · ${guests} Guests`;
  const mapQuery = villa?.mapQuery || location;

  return (
    <>
      <Head>
        <title>{title} — Move2Ibiza</title>
        <meta name="description" content={`${title} in ${location}`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
      </Head>

      <div className="font-sans text-slate-800 bg-slate-50 min-h-screen">
        {/* Header */}
<header
  className={`fixed inset-x-0 top-0 z-50 h-[72px] transition-all ${
    scrolled
      ? "bg-white/90 backdrop-blur shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
      : "bg-gradient-to-b from-[#0f1f28]/70 to-transparent"
  }`}
>
  <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    <a href="/" className="flex items-center gap-3 no-underline">
      <div className="h-8 w-8 rounded-xl bg-[#1B3A4B]" />
      <span className={`font-semibold tracking-wide ${
        scrolled ? "text-slate-900" : "text-white"
      }`}>Move2Ibiza</span>
    </a>
    <nav className={`hidden sm:flex items-center gap-6 text-sm ${
      scrolled ? "text-slate-700" : "text-white"
    }`}>
      <a href="/" className="opacity-90 hover:opacity-70">Start your search</a>
      <a href="/#featured" className="opacity-90 hover:opacity-70">Featured</a>
      <a href="/#contact" className="opacity-90 hover:opacity-70">Contact</a>
    </nav>
  </div>
</header>
        <div style={{ height: HEADER }} />

        {/* HERO */}
        <section className="relative">
          {images[0] ? (
            <img
              src={images[idx]}
              alt={title}
              className="w-full h-[80vh] object-cover"
            />
          ) : (
            <div className="w-full h-[60vh] bg-slate-200" />
          )}

          {/* Moody overlays (home vibe) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1b22]/80 via-[#0e1b22]/20 to-transparent" />
          <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_-180px_280px_-120px_rgba(10,20,28,0.75)]" />

          {/* Title + meta */}
          <div className="absolute bottom-16 left-6 md:left-12 right-6 md:right-12">
            <h1 className="text-white text-5xl md:text-6xl font-bold tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-white text-sm md:text-base backdrop-blur">
              {metaLine}
            </p>
          </div>

          {/* Arrows */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
              <button
                onClick={() =>
                  setIdx((i) => (i - 1 + images.length) % images.length)
                }
                className="h-10 w-10 grid place-items-center rounded-full bg-white/80 hover:bg-white pointer-events-auto"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % images.length)}
                className="h-10 w-10 grid place-items-center rounded-full bg-white/80 hover:bg-white pointer-events-auto"
                aria-label="Next image"
              >
                ›
              </button>
            </div>
          )}

          {/* Floating thumbnails */}
          {!!images.length && (
            <div className="absolute -bottom-10 left-0 right-0">
              <div className="mx-auto max-w-6xl px-4">
                <div className="rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-xl p-2.5 flex gap-2.5 overflow-x-auto justify-center">
                  {images.slice(0, 20).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`relative h-16 w-24 rounded-xl overflow-hidden ring-2 transition-all ${
                        i === idx
                          ? "ring-[#C6A36C]"
                          : "ring-transparent hover:ring-slate-200"
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* SPEC BAR (dark, luxe) */}
        <section className="bg-[#102735] text-white mt-20 py-6 shadow-md">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{bedrooms}</div>
              <div className="text-sm opacity-80">Bedrooms</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{bathrooms}</div>
              <div className="text-sm opacity-80">Bathrooms</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{guests}</div>
              <div className="text-sm opacity-80">Guests</div>
            </div>
          </div>
        </section>

        {/* Sticky tabs */}
        <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6">
              {(["Description", "Features", "Location", "Gallery"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 -mb-px border-b-2 text-sm transition-all ${
                      activeTab === tab
                        ? "border-[#C6A36C] text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "Description" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {villa?.description || "—"}
                </p>
              </section>
            )}

            {activeTab === "Features" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                  Features
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
                  {(villa as any)?.amenities?.length
                    ? (villa as any).amenities.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))
                    : ["Garden", "Outdoor kitchen", "BBQ", "Security"].map(
                        (f, i) => <li key={i}>{f}</li>
                      )}
                </ul>
              </section>
            )}

            {activeTab === "Location" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                  Location
                </h2>
                <iframe
                  className="w-full h-80 rounded-xl border border-slate-200 shadow-sm"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    mapQuery
                  )}&output=embed`}
                  title="Map"
                />
              </section>
            )}

            {activeTab === "Gallery" && images.length > 1 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.slice(1).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`${title} ${i + 2}`}
                      className="rounded-xl border border-slate-200 shadow-sm object-cover w-full h-48"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:sticky md:top-[120px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-sm text-slate-600">From</div>
              <div className="text-3xl font-semibold text-slate-900">
                {priceMonthly}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Minimum 1 month · Deposit applies
              </div>

              <form
                className="mt-5 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements.namedItem(
                    "name"
                  ) as HTMLInputElement)?.value;
                  const email = (e.currentTarget.elements.namedItem(
                    "email"
                  ) as HTMLInputElement)?.value;
                  const phone = (e.currentTarget.elements.namedItem(
                    "phone"
                  ) as HTMLInputElement)?.value;
                  const message = (e.currentTarget.elements.namedItem(
                    "message"
                  ) as HTMLTextAreaElement)?.value;

                  const subject = `Move2Ibiza enquiry: ${title}`;
                  const body = [
                    `Property: ${title}`,
                    `URL: ${typeof window !== "undefined" ? window.location.href : ""}`,
                    `Name: ${name}`,
                    `Email: ${email}`,
                    phone ? `Phone: ${phone}` : "",
                    "",
                    message,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  window.open(
                    `mailto:hello@move2ibiza.com?subject=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(body)}`
                  );
                }}
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  className="px-4 py-3 rounded-xl border border-slate-300"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="px-4 py-3 rounded-xl border border-slate-300"
                  required
                />
                <input
                  name="phone"
                  type="text"
                  placeholder="Phone / WhatsApp"
                  className="px-4 py-3 rounded-xl border border-slate-300"
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  className="px-4 py-3 rounded-xl border border-slate-300"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl font-semibold hover:opacity-95"
                  style={{ background: ACCENT, color: "#1f2937" }}
                >
                  Request Availability
                </button>
              </form>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="bg-[#0f2430] text-white mt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-white/70 text-sm">
            © {new Date().getFullYear()} Move2Ibiza — Powered by Invenio Homes
          </div>
        </footer>
      </div>
    </>
  );
}
