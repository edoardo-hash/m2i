// pages/v/[slug].tsx
"use client";

import WhatsAppButton from "../../components/WhatsAppButton";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Lightbox from "../../components/Lightbox";
import { useHeaderFade } from "../../lib/useHeaderFade";
const OSMMap = dynamic(() => import("../../components/OSMMap"), { ssr: false });

// --- helper types ---
type Photo = string | { url?: string; src?: string };
type Prices = { annual?: number | string; monthly?: number | string; summer?: number | string; winter?: number | string };
type Amenity = string | { name?: string; label?: string; group?: string; category?: string };

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
    guests?: number | string; // compatibility
    prices?: Prices;
  };
  price?: Prices;
  pricing?: Prices;
  rent?: Prices;
  priceAnnual?: number | string;
  yearly?: number | string;
};

// --- helpers ---
const toNum = (x: unknown) =>
  typeof x === "string" ? Number(x.replace(/[^\d.]/g, "")) : typeof x === "number" ? x : NaN;

const eur = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

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

// tiny neutral blur placeholder
const BLUR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAQAICRAEAOw==";

/* -------------------- FEATURES FILTERS -------------------- */
const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
const GROUPS_TO_HIDE = new Set<string>(["special features", "suitable for"]);
const LABELS_TO_HIDE = new Set<string>([
  // Special features (hide all)
  "boat usage","breakfast chef","butler","car usage","chef","driver",
  "eco tax on arrival 2.20€ per day per adult over 15","helicopter pad",
  "hire car recommended","house manager","live in staff","own water",
  "pets allowed","solar electricity","staff","waiter/waitress",

  // Suitable for (hide all)
  "couples","events","families","filming","friends","honeymoon","retreats","weddings",

  // Specific items (e.g. under Security)
  "security guard","sunloungers","massage area","dj equipmemt","smart tv","tv - satellite","slightly inclined","neighbours"]);

const featureName = (a: Amenity) => (typeof a === "string" ? a : a?.name || a?.label || "");
const featureGroup = (a: Amenity) => (typeof a === "string" ? "" : a?.group || a?.category || "");

const filterFeatures = (items: Amenity[]) =>
  (items || []).filter((item) => {
    if (GROUPS_TO_HIDE.has(norm(featureGroup(item)))) return false;
    if (LABELS_TO_HIDE.has(norm(featureName(item)))) return false;
    return true;
  });
/* --------------------------------------------------------- */

// tiny check icon for feature chips
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

// --- main page ---
export default function VillaPage() {
  const router = useRouter();
  const { slug } = router.query as { slug?: string };

  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<"desc" | "feat" | "loc" | "gal">("desc");
  const [lbOpen, setLbOpen] = useState(false);
  const [lbStart, setLbStart] = useState(0);

  const { style: headerStyle, light } = useHeaderFade(160);

  // Fetch villa
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        let v: Villa | null = null;
        const r1 = await fetch(`/api/invenio/villa?slug=${encodeURIComponent(slug)}`).catch(() => null);
        if (r1?.ok) {
          const d1 = await r1.json();
          v = (d1?.villa as Villa) || (d1 as Villa);
        }
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
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const images = useMemo(() => collectImages(villa), [villa]);
  useEffect(() => setIdx(0), [slug]);

  const title = villa?.title || "Villa";
// Store villa name globally for WhatsApp button
useEffect(() => {
  if (villa?.title) {
    window.localStorage.setItem("m2i_villaName", villa.title);
  }
}, [villa?.title]);

  const where = villa?.location || villa?.city || villa?.destination || "Ibiza";
  const bedrooms = villa?.meta?.bedrooms ?? "—";
  const bathrooms = villa?.meta?.bathrooms ?? "—";
  const prices = priceLine(villa);
  const lat = (villa as any)?.coords?.lat ?? (villa as any)?.lat ?? 38.984;
  const lng = (villa as any)?.coords?.lng ?? (villa as any)?.lng ?? 1.435;

  // Filter + sort amenities
  const amenities: Amenity[] = useMemo(() => {
    const raw = ((villa as any)?.amenities || []) as Amenity[];
    return filterFeatures(raw);
  }, [villa]);

  const displayedFeatures = useMemo(() => {
    const names = amenities.map((f) => featureName(f)).filter(Boolean) as string[];
    const byKey = new Map<string, string>();
    names.forEach((n) => byKey.set(norm(n), n));
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
  }, [amenities]);

  // --- Deep link tabs (hash) ---
  const hashToTab = (h: string): typeof tab => {
    const key = h.replace("#", "").toLowerCase();
    if (key.startsWith("desc") || key === "") return "desc";
    if (key.startsWith("feat") || key.startsWith("features")) return "feat";
    if (key.startsWith("loc") || key.startsWith("location")) return "loc";
    if (key.startsWith("gal") || key.startsWith("gallery")) return "gal";
    return "desc";
  };

  useEffect(() => {
    const applyHash = () => setTab(hashToTab(window.location.hash));
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const current = window.location.hash.replace("#", "");
    const desired =
      tab === "desc" ? "description" :
      tab === "feat" ? "features" :
      tab === "loc" ? "location" :
      "gallery";
    if (current !== desired) {
      const url = new URL(window.location.href);
      url.hash = desired;
      window.history.replaceState({}, "", url.toString());
    }
  }, [tab]);

  return (
    <>
      <Head>
        <title>{title} — Move2Ibiza</title>
        {images[0] && <meta property="og:image" content={images[0]} />}
      </Head>

      {/* Header with fade */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-[background-color] duration-150"
        style={headerStyle}
      >
        <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-end">
          <nav className={`flex items-center gap-6 text-sm ${light ? "text-white" : "text-slate-800"}`}>
            <a
              href="/"
              className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]"
            >
              Home
            </a>
            <a
              href="/#about"
              className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]"
            >
              About
            </a>
            <a
              href="/#contact"
              className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* HERO (with soft Ken Burns) */}
      <section className="relative">
        <div className="relative h-[60vh] sm:h-[70vh] md:h-[76vh] overflow-hidden">
          {images.length ? (
            <div className="absolute inset-0 kenburns">
              <Image
                key={images[idx]} // ensures blur per swap
                src={images[idx]}
                alt={title}
                fill
                priority
                unoptimized
                placeholder="blur"
                blurDataURL={BLUR}
                sizes="100vw"
                className="object-cover will-change-transform"
              />
            </div>
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

              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1 text-slate-900 text-sm md:text-base ring-1 ring-black/5 shadow-sm">
                <span>{where}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{bedrooms} bedrooms</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{bathrooms} bathrooms</span>
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

        {/* thumbnails */}
        {images.length > 1 && (
          <div className="relative -mt-8 sm:-mt-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="overflow-x-auto no-scrollbar">
                <div className="flex gap-2 rounded-2xl bg-white/90 backdrop-blur-sm ring-1 ring-slate-200 p-2 shadow-xl w-max">
                  {images.slice(0, 40).map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`relative h-16 w-24 flex-none overflow-hidden rounded-md transition-all ${
                        i === idx
                          ? "ring-4 ring-[#C6A36C] shadow-[0_0_0_4px_rgba(198,163,108,0.35)]"
                          : "ring-1 ring-slate-200 hover:ring-slate-300"
                      }`}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        unoptimized
                        placeholder="blur"
                        blurDataURL={BLUR}
                        sizes="192px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Prices pill */}
      {prices && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white ring-1 ring-slate-200 px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-slate-600">Prices</span>
            <span className="text-sm font-semibold text-slate-900">{prices}</span>
          </div>
        </div>
      )}

      {/* Spec bar (guests removed) */}
      <section className="bg-slate-900 text-white mt-8 sm:mt-10">
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-2xl font-semibold">{bedrooms}</div>
            <div className="text-white/85">Bedrooms</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{bathrooms}</div>
            <div className="text-white/85">Bathrooms</div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-[#C6A36C]" />
      </section>

      {/* Tabs (sticky + hash) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="sticky top-16 z-30 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
          <div className="flex gap-6">
            {[
              { id: "desc", label: "Description" },
              { id: "feat", label: "Features" },
              { id: "loc", label: "Location" },
              { id: "gal", label: "Gallery" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id as any)}
                aria-current={tab === id ? "page" : undefined}
                className={`pb-3 -mb-px text-sm font-medium border-b-4 ${
                  tab === id ? "border-[#C6A36C] text-slate-900" : "border-transparent text-slate-600 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Panels */}
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {tab === "desc" && (
              <section id="description" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Description</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {villa?.description || "Details coming soon."}
                </p>
              </section>
            )}

            {tab === "feat" && (
              <section id="features" className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-1 text-slate-900">Features</h2>
                <p className="text-sm text-slate-500 mb-4"></p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {displayedFeatures.length ? (
                    displayedFeatures.map((label, i) => (
                      <li
                        key={i}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow transition-shadow"
                      >
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <span className="text-slate-800">{label}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">No features listed.</li>
                  )}
                </ul>
              </section>
            )}

            {tab === "loc" && (
              <section id="location" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Location</h2>
                <OSMMap lat={lat} lng={lng} zoom={10.5} />
              </section>
            )}

            {tab === "gal" && (
              <section id="gallery" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold mb-4 text-slate-900">Gallery</h2>
                {images.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setLbStart(i);
                          setLbOpen(true);
                        }}
                        className="relative aspect-[4/3] overflow-hidden ring-1 ring-slate-200 rounded-xl focus:outline-none"
                        aria-label={`Open image ${i + 1}`}
                      >
                        <Image
                          src={g}
                          alt=""
                          fill
                          unoptimized
                          placeholder="blur"
                          blurDataURL={BLUR}
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No gallery images available.</p>
                )}
              </section>
            )}
          </div>

          {/* Sidebar (CONTACT — same as homepage) */}
          <aside className="md:sticky md:top-[120px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="font-serif text-2xl font-semibold text-slate-900">Contact us</h2>

              <p className="mt-3 text-slate-600 leading-relaxed">
                <strong>Moving to Ibiza begins with a conversation.</strong>
                <br />
                Whether you’re searching for a villa, an apartment, or simply exploring your options,
                our team is here to guide you. We value privacy, clarity, and personal attention — every
                enquiry is handled with care and discretion.
                <br />
                <br />
                Let’s find your place in Ibiza.
                <br />
                📧{" "}
                <a href="mailto:M2Ibiza@inveniohomes.com" className="underline">
                  M2Ibiza@inveniohomes.com
                </a>
                <br />
                📞{" "}
                <a href="tel:+34671349592" className="underline">
                  +34 671 349 592
                </a>
              </p>

              <form
                className="mt-6 grid grid-cols-1 gap-3"
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
                    `mailto:M2Ibiza@inveniohomes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  );
                }}
              >
                <input
                  name="name"
                  placeholder="Name"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone / WhatsApp"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                />
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Message"
                  className="rounded-xl border border-slate-200 px-4 py-3"
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full rounded-full px-5 py-3 font-semibold"
                  style={{ background: "#C6A36C", color: "#1f2937" }}
                >
                  Send inquiry
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-white/80 text-sm">
          © {new Date().getFullYear()} Move2Ibiza — Powered by Invenio Homes
        </div>
      </footer>

  {/* Lightbox */}
<Lightbox images={images} isOpen={lbOpen} startIndex={lbStart} onClose={() => setLbOpen(false)} />

{/* WhatsApp Floating Button */}
<WhatsAppButton />
      {/* Ken Burns keyframes (scoped) */}
      <style jsx global>{`
        @keyframes m2i-kenburns {
          0% { transform: scale(1.0); }
          100% { transform: scale(1.05); }
        }
        .kenburns {
          animation: m2i-kenburns 25s ease-in-out infinite alternate;
          transform-origin: center center;
          will-change: transform;
        }
      `}</style>
    </>
  );
}
