import Head from "next/head";
import { useEffect, useState } from "react";

/**
 * Assets expected in /public:
 *  - es-vedra-hero.jpg        (Es Vedrà hero image)
 *  - move2ibiza-logo.png      (transparent logo)
 */

type VillaItem = {
  slug?: string;
  title?: string;
  location?: string;
  city?: string;
  destination?: string;
  cover?: string;
  images?: string[];
  photos?: Array<{ url?: string; src?: string }>;
  gallery?: Array<{ url?: string; src?: string }>;
  meta?: {
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    prices?: { annual?: string | number; monthly?: string | number };
  };
};

/* ========= Tiny inline icons for the card meta ========= */
const IconBed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 7h18M6 7v7m12-7v7M3 14h18v3H3z" strokeWidth="1.5" />
  </svg>
);
const IconBath = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M7 10V6a2 2 0 1 1 4 0v4m7 0H4v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5Z" strokeWidth="1.5" />
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm8 10v-2a4 4 0 0 0-3-3.87M17 11a4 4 0 0 0-1-2.62" strokeWidth="1.5"/>
  </svg>
);

export default function Home() {
  const [villas, setVillas] = useState<VillaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- helpers ----------
  function firstImage(v: VillaItem): string | undefined {
    if (v.cover) return v.cover;
    if (v.images?.[0]) return v.images[0];
    const p = v.photos?.find((x) => x.url || x.src);
    if (p?.url || p?.src) return (p.url || p.src) as string;
    const g = v.gallery?.find((x) => x.url || x.src);
    return (g?.url || g?.src) as string | undefined;
  }
  function loc(v: VillaItem) {
    return v.location || v.city || v.destination || "Ibiza";
  }
  function beds(v: VillaItem) {
    return v.meta?.bedrooms ?? "—";
  }
  function baths(v: VillaItem) {
    return v.meta?.bathrooms ?? "—";
  }
  function guests(v: VillaItem) {
    return v.meta?.guests ?? "—";
  }
  function formatEuro(n: string | number | undefined) {
    if (n === undefined || n === null || n === "" || n === "—") return "—";
    const num =
      typeof n === "string"
        ? Number(String(n).replace(/[^\d.-]/g, ""))
        : Number(n);
    if (Number.isNaN(num)) return "—";
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(num);
  }
  function priceBadge(annual?: string | number) {
    if (annual === undefined || annual === null || annual === "" || Number(annual) === 0) {
      return { label: "Contact us", isContact: true };
    }
    return { label: `from ${formatEuro(annual)} / year`, isContact: false };
  }

  // ---------- load villas ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/invenio/villas");
        const data = await res.json();
        setVillas(data?.villas ?? []);
      } catch (e) {
        console.error("Failed to load villas", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Move2Ibiza — Luxury Long-Term Villas</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ====== GOLD RIBBON HEADER ====== */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#C6A36C] shadow-[0_2px_20px_rgba(0,0,0,0.15)]">
        <div className="mx-auto max-w-7xl h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand */}
          <a href="/" className="flex items-center gap-3 no-underline">
            <img
              src="/move2ibiza-logo.png"
              alt="Move2Ibiza"
              className="h-8 w-auto"
            />
            <span className="sr-only">Move2Ibiza</span>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] text-slate-900">
            <a href="#search" className="hover:opacity-75">Start your search</a>
            <a href="#featured" className="hover:opacity-75">Featured</a>
            <a href="#contact" className="hover:opacity-75">Contact</a>
            <a
              href="/v/can-emily-aa6f68c5-51d1-4b0f-9e63-5701d9c25955"
              className="inline-flex items-center gap-2 h-9 rounded-full px-4 text-sm font-medium
                         bg-white/20 border border-white/40 text-slate-900 hover:bg-white/30"
            >
              View Villa Page <span className="translate-y-px">→</span>
            </a>
          </nav>
        </div>
      </header>
      {/* spacer for fixed header */}
      <div className="h-14 sm:h-16" />

      {/* ====== HERO ====== */}
      <section
        className="relative h-[90vh] flex flex-col justify-center text-center text-white bg-cover bg-center"
        style={{ backgroundImage: "url('/es-vedra-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4">
            Luxury long-term villas <br /> in Ibiza.
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10">
            Handpicked homes for extended stays — privacy, views, and
            concierge-level comfort.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <a
              href="#featured"
              className="rounded-full bg-[#C6A36C] text-slate-900 px-6 py-3 text-base font-semibold hover:bg-[#b8925e]"
            >
              Explore Villas
            </a>
            <a
              href="#search"
              className="rounded-full bg-white/20 border border-white/40 px-6 py-3 text-base font-semibold hover:bg-white/30"
            >
              Start your search
            </a>
          </div>

          {/* Search bar */}
          <div
            id="search"
            className="flex flex-wrap justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl py-4 px-6 max-w-3xl mx-auto"
          >
            <input
              type="text"
              placeholder="Location (e.g., Santa Gertrudis)"
              className="rounded-xl px-4 py-2 text-slate-900 bg-white/90 w-[230px] placeholder-slate-500 focus:outline-none"
            />
            <select className="rounded-xl px-4 py-2 text-slate-900 bg-white/90 w-[150px] focus:outline-none">
              <option>Bedrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <input
              type="text"
              placeholder="Monthly budget (€)"
              className="rounded-xl px-4 py-2 text-slate-900 bg-white/90 w-[200px] placeholder-slate-500 focus:outline-none"
            />
            <button className="rounded-xl bg-[#C6A36C] text-slate-900 font-semibold px-6 py-2 hover:bg-[#b8925e]">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ====== FEATURED GRID (Lush-style) ====== */}
      <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Featured villas</h2>
          <a href="#search" className="text-sm text-slate-600 hover:text-slate-900">See all</a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-white ring-1 ring-slate-200 overflow-hidden shadow-sm">
                <div className="aspect-[16/10] bg-slate-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {villas.map((v, i) => {
              const img = firstImage(v);
              const href = `/v/${encodeURIComponent(v.slug || "")}`;
              const p = priceBadge(v.meta?.prices?.annual);

              return (
                <a
                  key={(v.slug || `villa-${i}`) + i}
                  href={href}
                  className="group block rounded-3xl bg-white overflow-hidden ring-1 ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={v.title || "Villa"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200" />
                    )}
                    {/* Location chip – white, soft ring */}
                    <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 text-slate-900 text-xs px-2 py-1 shadow-sm ring-1 ring-white/70">
                      {loc(v)}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {v.title || "Untitled"}
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          p.isContact
                            ? "bg-slate-100 text-slate-700"
                            : "bg-[#C6A36C] text-slate-900"
                        }`}
                        title="Annual price"
                      >
                        {p.label}
                      </span>
                    </div>

                    {/* Meta with icons */}
                    <div className="mt-3 flex items-center gap-5 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <IconBed /> {beds(v)} bd
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconBath /> {baths(v)} ba
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconUsers /> {guests(v)} guests
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#C6A36C] text-slate-900 text-xs font-semibold px-3 py-1
                                   group-hover:translate-x-0.5 transition-transform"
                      >
                        View details <span className="translate-y-px">→</span>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* ====== FOOTER ====== */}
      <footer id="contact" className="bg-[#0f2430] text-white mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <img src="/move2ibiza-logo.png" alt="Move2Ibiza" className="h-12 w-auto" />
          </div>
          <div className="text-white/80">
            Handpicked homes for extended stays — privacy, views, and concierge-level comfort.
          </div>
          <div className="flex md:justify-end gap-4 text-white/80">
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">WhatsApp</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
        <div className="text-center text-white/60 text-sm pb-8">
          © {new Date().getFullYear()} Move2Ibiza — Powered by Invenio Homes
        </div>
      </footer>
    </>
  );
}
