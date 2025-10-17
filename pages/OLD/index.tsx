import Head from "next/head";
import { useEffect, useState } from "react";

/**
 * Assets expected in /public:
 *  - es-vedra-hero.jpg
 *  - move2ibiza-logo.png
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
    bedrooms?: number | string;
    bathrooms?: number | string;
    guests?: number | string;
    prices?: {
      annual?: number | string;
      monthly?: number | string;
      summer?: number | string;
      winter?: number | string;
    };
  };
  priceAnnual?: number | string;
  annual?: number | string;
  price?: { annual?: number | string; monthly?: number | string; summer?: number | string; winter?: number | string };
  pricing?: { annual?: number | string; monthly?: number | string; summer?: number | string; winter?: number | string };
  yearly?: number | string;
  rent?: { annual?: number | string; monthly?: number | string; summer?: number | string; winter?: number | string };
};

export default function Home() {
  const [villas, setVillas] = useState<VillaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // -------- helpers --------
  const firstImage = (v: VillaItem): string | undefined => {
    if (v.cover) return v.cover;
    if (v.images?.[0]) return v.images[0];
    const p = v.photos?.find((x) => x.url || x.src);
    if (p?.url || p?.src) return (p.url || p.src) as string;
    const g = v.gallery?.find((x) => x.url || x.src);
    return (g?.url || g?.src) as string | undefined;
  };

  const loc = (v: VillaItem) => v.location || v.city || v.destination || "Ibiza";

  // Build one line with available prices in order: winter -> summer -> year
  const formatPriceLine = (v: any): string | undefined => {
    const toNumber = (x: unknown) =>
      typeof x === "string" ? Number((x as string).replace(/[^\d.]/g, "")) : typeof x === "number" ? x : NaN;
    const eur = (n: number) =>
      new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

    const pick = (...vals: unknown[]) => {
      const n = vals.map(toNumber).find((x) => Number.isFinite(x) && (x as number) > 0);
      return Number.isFinite(n as number) ? (n as number) : undefined;
    };

    const winter = pick(v?.meta?.prices?.winter, v?.price?.winter, v?.pricing?.winter, v?.rent?.winter);
    const summer = pick(v?.meta?.prices?.summer, v?.price?.summer, v?.pricing?.summer, v?.rent?.summer);
    const annual = pick(
      v?.meta?.prices?.annual,
      v?.priceAnnual,
      v?.annual,
      v?.price?.annual,
      v?.pricing?.annual,
      v?.yearly,
      v?.rent?.annual
    );

    const parts: string[] = [];
    if (winter) parts.push(`${eur(winter)} / winter`);
    if (summer) parts.push(`${eur(summer)} / summer`);
    if (annual) parts.push(`${eur(annual)} / year`);

    return parts.length ? parts.join(" - ") : undefined;
  };

  // -------- load villas --------
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
      </Head>
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
    
      
    
    

      {/* ===== HERO (unchanged) ===== */}
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
            Handpicked homes for extended stays — privacy, views, and concierge-level comfort.
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

          <div
            id="search"
            className="flex flex-wrap justify-center gap-2 bg-white/10 backdrop-blur-sm-sm rounded-2xl py-4 px-6 max-w-3xl mx-auto"
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

      {/* ===== FEATURED (full-bleed, squared, 3-up, serif headings) ===== */}
<section
  id="featured"
  className="pt-8 pb-16 transition-all duration-500 ease-out scroll-mt-16"
>        {/* Header */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 mb-10 flex items-center justify-between border-b border-slate-200 pb-3">
  <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
    Featured villas
  </h2>
  <a
    href="#search"
    className="text-sm sm:text-base font-medium text-[#C6A36C] hover:text-[#b8925e] transition-colors"
  >
    See all →
  </a>
</div>

        {/* FULL-BLEED GRID */}
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <div className="px-4 sm:px-6 lg:px-10 xl:px-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white ring-1 ring-slate-200 shadow-sm">
                      <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                      <div className="h-24 bg-slate-100 animate-pulse" />
                    </div>
                  ))
                : villas.slice(0, 12).map((v, idx) => {
                    const img = firstImage(v) || "/placeholder.jpg";
                    const priceLine = formatPriceLine(v);
                    const bedrooms = v.meta?.bedrooms ?? "—";
                    const bathrooms = v.meta?.bathrooms ?? "—";

                    return (
                      <a
                        key={v.slug || idx}
                        href={`/v/${v.slug}`}
                        className="group block bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-md transition"
                      >
                        {/* IMAGE (square corners) */}
                        <div className="relative aspect-[4/3]">
                          <img
                            src={img}
                            alt={v.title || "Ibiza villa"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            loading="lazy"
                            sizes="(min-width:1280px) 33vw, (min-width:640px) 50vw, 100vw"
                          />
                        </div>

                        {/* CARD BODY */}
                        <div className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900 truncate">
                              {v.title || "Untitled villa"}
                            </h3>

                            {priceLine && (
                              <div className="text-right shrink-0 text-xs sm:text-sm font-semibold text-slate-900 max-w-[55%] sm:max-w-[60%] leading-snug">
                                {priceLine}
                              </div>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                            <span className="truncate">{loc(v)}</span>
                          </div>

                          {/* Icons + words */}
                          <div className="mt-2 flex items-center gap-6 text-sm text-slate-700">
                            <span className="inline-flex items-center gap-2">
                              {/* bed icon */}
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M3 7h18M6 7v7m12-7v7M3 14h18v3H3z" strokeWidth="1.5" />
                              </svg>
                              <span className="whitespace-nowrap">{bedrooms} bedrooms</span>
                            </span>
                            <span className="inline-flex items-center gap-2">
                              {/* bath icon */}
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M7 10V6a2 2 0 1 1 4 0v4m7 0H4v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5Z" strokeWidth="1.5" />
                              </svg>
                              <span className="whitespace-nowrap">{bathrooms} bathrooms</span>
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
