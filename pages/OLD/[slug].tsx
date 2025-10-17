// pages/v/[slug].tsx
"use client";

import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import SiteHeader from "../../components/SiteHeader";

/* ---------- Types (loose to fit your API) ---------- */
type Photo = string | { url?: string; src?: string };
type Prices = { annual?: number | string; monthly?: number | string; summer?: number | string; winter?: number | string };

type Villa = {
  slug?: string;
  title?: string;
  location?: string;
  city?: string;
  destination?: string;
  description?: string;
  mapQuery?: string;
  cover?: string;
  images?: Photo[];
  photos?: Photo[];
  gallery?: Photo[];
  meta?: {
    bedrooms?: number | string;
    bathrooms?: number | string;
    guests?: number | string;
    prices?: Prices;
  };
  price?: Prices;
  pricing?: Prices;
  rent?: Prices;
  priceAnnual?: number | string;
  yearly?: number | string;
};

/* ---------- Helpers ---------- */
const toNum = (x: unknown) =>
  typeof x === "string" ? Number(x.replace(/[^\d.]/g, "")) : typeof x === "number" ? x : NaN;

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// “€56,000 / winter - €30,000 / summer - €60,000 / year” (only show non-zero)
function priceLine(v: Villa | null): string | undefined {
  if (!v) return;
  const pick = (...vals: unknown[]) => {
    const n = vals.map(toNum).find((x) => Number.isFinite(x) && (x as number) > 0);
    return Number.isFinite(n as number) ? (n as number) : undefined;
  };
  const winter = pick(v.meta?.prices?.winter, v.price?.winter, v.pricing?.winter, v.rent?.winter);
  const summer = pick(v.meta?.prices?.summer, v.price?.summer, v.pricing?.summer, v.rent?.summer);
  const annual = pick(v.meta?.prices?.annual, v.priceAnnual, v.yearly, v.price?.annual, v.pricing?.annual, v.rent?.annual);

  const parts: string[] = [];
  if (winter) parts.push(`${eur(winter)} / winter`);
  if (summer) parts.push(`${eur(summer)} / summer`);
  if (annual) parts.push(`${eur(annual)} / year`);
  return parts.length ? parts.join(" - ") : undefined;
}

const photoSrc = (p?: Photo) => (typeof p === "string" ? p : p?.url || p?.src);

function collectImages(v: Villa | null): string[] {
  if (!v) return [];
  const list = [
    v.cover,
    ...(v.images ?? []).map(photoSrc),
    ...(v.photos ?? []).map(photoSrc),
    ...(v.gallery ?? []).map(photoSrc),
  ].filter(Boolean) as string[];
  return Array.from(new Set(list));
}

/* ---------- Page ---------- */
export default function VillaPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [tab, setTab] = useState<"desc" | "feat" | "loc" | "gal">("desc");

  // Load data
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        // detail endpoint first
        let v: Villa | null = null;
        try {
          const r1 = await fetch(`/api/invenio/villa?slug=${encodeURIComponent(slug)}`);
          if (r1.ok) {
            const d1 = await r1.json();
            v = (d1?.villa as Villa) || (d1 as Villa);
          }
        } catch {}
        // fallback to list
        if (!v) {
          const r2 = await fetch("/api/invenio/villas");
          const d2 = await r2.json();
          const list: Villa[] = d2?.villas || d2 || [];
          v =
            list.find((x) => x.slug === slug) ||
            list.find((x) => (x.slug || "").includes(String(slug))) ||
            (list.length ? list[0] : null);
        }
        setVilla(v ?? null);
      } catch (e) {
        console.error(e);
        setVilla(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // Header scroll feel
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const images = useMemo(() => collectImages(villa), [villa]);
  useEffect(() => setIdx(0), [slug]);

  const title = villa?.title || "Villa";
  const where = villa?.location || villa?.city || villa?.destination || "Ibiza";
  const bedrooms = villa?.meta?.bedrooms ?? "—";
  const bathrooms = villa?.meta?.bathrooms ?? "—";
  const guests = villa?.meta?.guests ?? "—";
  const prices = priceLine(villa);
  const mapQuery = villa?.mapQuery || where;

  return (
    <>
      <Head>
        <title>{title} — Move2Ibiza</title>
        {images[0] && <meta property="og:image" content={images[0]} />}
      </Head>

      {/* Header (transparent over hero, gold hovers like Home) */}
            {/* Header (transparent over hero, gold hovers like Home) */}
            {/* Header (overlay: transparent on top; solid on scroll) */}
            {/* Header (transparent overlay with logo + text) */}
            {/* Header: fully transparent at top; subtle on scroll */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${scrolled ? "backdrop-blur-sm bg-white/30" : "bg-transparent"}`}>
        <div className="mx-auto max-w-7xl h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2" aria-label="Move2Ibiza home">
            <img src="/m2i-logo.png" alt="Move2Ibiza logo" className="h-9 w-auto" />
            <span className={`${scrolled ? "text-slate-900" : "text-white"} font-semibold tracking-wide text-sm sm:text-base`}>Move2Ibiza</span>
          </a>
          <nav className={`hidden sm:flex items-center gap-6 text-sm ${scrolled ? "text-slate-800" : "text-white"}`}>
            <a href="/" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">Start your search</a>
            <a href="/#featured" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">Featured</a>
            <a href="/#contact" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">Contact</a>
          </nav>
        </div>
      </header>
    
      
    
    {/* HERO (title serif like Home card names, light chip) */}
      <section className="relative">
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[76vh]">
          {images.length ? (
            <img src={images[idx]} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-slate-200" />
          )}
          <div className="absolute inset-0 bg-black/15" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/40 to-black/75" />

          <div className="absolute inset-x-0 bottom-6 sm:bottom-8 md:bottom-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-white drop-shadow">
                {title}
              </h1>

              {/* light chip to match homepage chips */}
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-slate-900 text-sm md:text-base ring-1 ring-black/5 shadow-sm">
                <span>{where}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{bedrooms} bedrooms</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{bathrooms} bathrooms</span>
                {guests !== "—" && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{guests} guests</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* arrows */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
            <button
              onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
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

        {/* Floating thumbnails — slate by default, gold when active (like home pills/rings) */}
        {images.length > 1 && (
          <div className="relative -mt-8 sm:-mt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="inline-flex gap-2 rounded-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-200 p-2 shadow-xl">
                {images.slice(0, 20).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative h-16 w-24 overflow-hidden rounded-md transition-all ${
                      i === idx
                        ? "ring-4 ring-[#C6A36C] shadow-[0_0_0_4px_rgba(198,163,108,0.35)]"
                        : "ring-1 ring-slate-200 hover:ring-slate-300"
                    }`}
                  >
                    <img src={src} className="absolute inset-0 w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Prices pill (same language/feel as home) */}
      {prices && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white ring-1 ring-slate-200 px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-slate-600">Prices</span>
            <span className="text-sm font-semibold text-slate-900">{prices}</span>
          </div>
        </div>
      )}

      {/* Spec bar (slate) + gold divider like home accents */}
      <section className="bg-slate-900 text-white mt-8 sm:mt-10">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-semibold"> {bedrooms} </div>
            <div className="text-white/85">Bedrooms</div>
          </div>
          <div>
            <div className="text-2xl font-semibold"> {bathrooms} </div>
            <div className="text-white/85">Bathrooms</div>
          </div>
          <div>
            <div className="text-2xl font-semibold"> {guests} </div>
            <div className="text-white/85">Guests</div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-[#C6A36C]" />
      </section>

      {/* Tabs (gold active underline) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex gap-6 border-b border-slate-200">
          <button
            onClick={() => setTab("desc")}
            className={`pb-3 -mb-px text-sm font-medium border-b-4 ${
              tab === "desc" ? "border-[#C6A36C] text-slate-900" : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setTab("feat")}
            className={`pb-3 -mb-px text-sm font-medium border-b-4 ${
              tab === "feat" ? "border-[#C6A36C] text-slate-900" : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setTab("loc")}
            className={`pb-3 -mb-px text-sm font-medium border-b-4 ${
              tab === "loc" ? "border-[#C6A36C] text-slate-900" : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Location
          </button>
          <button
            onClick={() => setTab("gal")}
            className={`pb-3 -mb-px text-sm font-medium border-b-4 ${
              tab === "gal" ? "border-[#C6A36C] text-slate-900" : "border-transparent text-slate-600 hover:text-slate-800"
            }`}
          >
            Gallery
          </button>
        </div>

        {/* Panels */}
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {tab === "desc" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Description</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {villa?.description || "Details coming soon."}
                </p>
              </section>
            )}

            {tab === "feat" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-700">
                  {((villa as any)?.amenities || []).length ? (
                    (villa as any).amenities.map((f: string, i: number) => <li key={i}>{f}</li>)
                  ) : (
                    <li className="text-slate-500">No features listed.</li>
                  )}
                </ul>
              </section>
            )}

            {tab === "loc" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Location</h2>
                <iframe
                  className="w-full h-80 rounded-xl border border-slate-200 shadow-sm"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  title="Map"
                />
              </section>
            )}

            {tab === "gal" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Gallery</h2>
                {images.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((g, i) => (
                      <div key={i} className="relative aspect-[4/3] overflow-hidden ring-1 ring-slate-200 rounded-xl">
                        <img src={g} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No gallery images available.</p>
                )}
              </section>
            )}
          </div>

          {/* Sidebar (CTA like home’s gold button) */}
          <aside className="md:sticky md:top-[120px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-sm text-slate-600">From</div>
              <div className="text-3xl font-semibold text-slate-900">
                {villa?.meta?.prices?.monthly || "Contact us"}
              </div>
              <div className="text-xs text-slate-500 mt-1">Minimum 1 month · Deposit applies</div>

              <form
                className="mt-5 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement)?.value;
                  const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value;
                  const phone = (e.currentTarget.elements.namedItem("phone") as HTMLInputElement)?.value;
                  const message = (e.currentTarget.elements.namedItem("message") as HTMLTextAreaElement)?.value;

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
                    `mailto:hello@move2ibiza.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  );
                }}
              >
                <input name="name" type="text" placeholder="Your name" className="px-4 py-3 rounded-xl border border-slate-300" required />
                <input name="email" type="email" placeholder="Email" className="px-4 py-3 rounded-xl border border-slate-300" required />
                <input name="phone" type="text" placeholder="Phone / WhatsApp" className="px-4 py-3 rounded-xl border border-slate-300" />
                <textarea name="message" placeholder="Message" rows={4} className="px-4 py-3 rounded-xl border border-slate-300" required />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-full font-semibold hover:opacity-95 transition"
                  style={{ background: "#C6A36C", color: "#1f2937" }}
                >
                  Request Availability
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer (slate like home neutrals) */}
      <footer className="bg-slate-900 text-white mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-white/80 text-sm">
          © {new Date().getFullYear()} Move2Ibiza — Powered by Invenio Homes
        </div>
      </footer>
    </>
  );
}
