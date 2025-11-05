// pages/index.tsx
'use client';

import MobileNavSheet from "../components/MobileNavSheet";
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { availability, eur0, monthlyFromVilla } from '../lib/pricing';
import SiteHeaderHero from '../components/SiteHeaderHero';

type Villa = any;
type RentalType = 'any' | 'winter' | 'summer' | 'yearly';

const getSlug = (v: Villa): string | undefined =>
  v?.slug || v?.id || v?._id || v?.airtableId;

/* ---------- helpers: tolerant numeric & string reads ---------- */

const readNumber = (obj: any, keys: string[]): number | undefined => {
  for (const k of keys) {
    const raw = obj?.[k];
    if (raw == null) continue;
    const n =
      typeof raw === 'number'
        ? raw
        : Number(String(raw).replace(/[^\d.]/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const readString = (obj: any, keys: string[]): string | undefined => {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
};

/* ---------- deep search helpers (handles nested objects/arrays) ---------- */

const isPlainObject = (v: any) =>
  v && typeof v === 'object' && !Array.isArray(v);

type KeyCheck = (key: string) => boolean;

const deepFindNumber = (
  node: any,
  keyCheck: KeyCheck
): number | undefined => {
  if (node == null) return undefined;

  if (Array.isArray(node)) {
    for (const item of node) {
      const n = deepFindNumber(item, keyCheck);
      if (typeof n === 'number') return n;
    }
    return undefined;
  }

  if (isPlainObject(node)) {
    for (const [k, v] of Object.entries(node)) {
      const lowerK = k.toLowerCase();

      if (keyCheck(lowerK)) {
        const n =
          typeof v === 'number'
            ? v
            : Number(String(v).replace(/[^\d.]/g, ''));
        if (Number.isFinite(n)) return n;
      }

      const n = deepFindNumber(v, keyCheck);
      if (typeof n === 'number') return n;
    }
  }

  return undefined;
};

/* ---------- description fallback ---------- */

const parseFromDescription = (v: any, type: 'bed' | 'bath'): number | undefined => {
  const desc =
    readString(v, ['description', 'details', 'summary', 'info']) || '';
  if (!desc) return undefined;
  const re = type === 'bed'
    ? /(\d+)\s*bed(?:room)?s?\b/i
    : /(\d+)\s*bath(?:room)?s?\b/i;
  const m = desc.match(re);
  return m ? Number(m[1]) : undefined;
};

/* ---------- bedroom/bathroom resolvers ---------- */

const getBedroomsFlat = (v: any) =>
  readNumber(v, [
    'bedrooms',
    'bedroom',
    'beds',
    'beds_total',
    'bedsTotal',
    'bedrooms_count',
    'bedroom_count',
    'num_bedrooms',
    'n_bedrooms',
    'rooms',
    'rooms_count',
  ]);

const getBathroomsFlat = (v: any) =>
  readNumber(v, [
    'bathrooms',
    'bathroom',
    'baths',
    'baths_total',
    'bathsTotal',
    'bathrooms_count',
    'bathroom_count',
    'num_bathrooms',
    'n_bathrooms',
    'wc',
    'toilets',
  ]);

const getBedroomsDeep = (v: any) =>
  deepFindNumber(v, (key) =>
    /bed(room)?s?$/.test(key) ||
    key === 'beds' ||
    key === 'beds_total' ||
    key === 'bedrooms_count' ||
    key === 'num_bedrooms'
  );

const getBathroomsDeep = (v: any) =>
  deepFindNumber(v, (key) =>
    /bath(room)?s?$/.test(key) ||
    key === 'baths' ||
    key === 'baths_total' ||
    key === 'bathrooms_count' ||
    key === 'num_bathrooms' ||
    key === 'wc' ||
    key === 'toilets'
  );

const getBedrooms = (v: any) =>
  getBedroomsFlat(v) ?? getBedroomsDeep(v) ?? parseFromDescription(v, 'bed');

const getBathrooms = (v: any) =>
  getBathroomsFlat(v) ?? getBathroomsDeep(v) ?? parseFromDescription(v, 'bath');

/* ---------- PRICE RESOLVERS (match the villa page, then convert to /month) ---------- */

const toNum = (x: unknown) =>
  typeof x === 'string' ? Number(x.replace(/[^\d.]/g, '')) : typeof x === 'number' ? x : NaN;

const pickFirstNumber = (...vals: unknown[]) => {
  const n = vals.map(toNum).find((x) => Number.isFinite(x) && (x as number) > 0);
  return Number.isFinite(n as number) ? (n as number) : undefined;
};

// total -> monthly converters (fallback to monthlyFromVilla if no total available)
const priceYearly = (v: Villa) => {
  const annualTotal = pickFirstNumber(
    v?.meta?.prices?.annual,
    v?.priceAnnual,
    v?.yearly,
    v?.price?.annual,
    v?.pricing?.annual,
    v?.rent?.annual
  );
  if (typeof annualTotal === 'number') return Math.round(annualTotal / 12);
  return (monthlyFromVilla as any)?.(v, 'yearly');
};

const priceSummer = (v: Villa) => {
  const summerTotal = pickFirstNumber(
    v?.meta?.prices?.summer,
    v?.price?.summer,
    v?.pricing?.summer,
    v?.rent?.summer
  );
  if (typeof summerTotal === 'number') return Math.round(summerTotal / 6);
  return (monthlyFromVilla as any)?.(v, 'summer');
};

const priceWinter = (v: Villa) => {
  const winterTotal = pickFirstNumber(
    v?.meta?.prices?.winter,
    v?.price?.winter,
    v?.pricing?.winter,
    v?.rent?.winter
  );
  if (typeof winterTotal === 'number') return Math.round(winterTotal / 6);
  return (monthlyFromVilla as any)?.(v, 'winter');
};

/* ---------- component ---------- */

export default function Home() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [budgetRaw, setBudgetRaw] = useState<string>('');
  const [budget, setBudget] = useState<number | undefined>();
  const [rentalType, setRentalType] = useState<RentalType>('any');
  const [showAbout, setShowAbout] = useState(false);
  const aboutRef = useRef<HTMLElement | null>(null);

  // Fetch villas
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/invenio/villas');
      const data = await res.json();
      const list = data?.villas || data || [];
      setVillas(Array.isArray(list) ? list : []);
    })();
  }, []);

  // Debounce numeric budget parsing
  useEffect(() => {
    const id = setTimeout(() => {
      const n = Number(String(budgetRaw).replace(/[^\d.]/g, ''));
      setBudget(Number.isFinite(n) && n > 0 ? n : undefined);
    }, 250);
    return () => clearTimeout(id);
  }, [budgetRaw]);

  // Locations for dropdown — filtered by active filters
  const availableLocations = useMemo(() => {
    const pool = Array.isArray(villas) ? villas : [];
    const validLocations = new Set<string>();

    for (const v of pool) {
      const { hasWinter, hasSummer, hasAnnual } = availability(v);
      const matchesRental =
        rentalType === 'any' ||
        (rentalType === 'winter' && hasWinter) ||
        (rentalType === 'summer' && hasSummer) ||
        (rentalType === 'yearly' && hasAnnual);
      if (!matchesRental) continue;

      const m = monthlyFromVilla(v);
      const matchesBudget = !budget || (typeof m === 'number' && m <= budget);
      if (!matchesBudget) continue;

      const loc = readString(v, ['location', 'city', 'destination']) || '';
      if (loc) validLocations.add(loc);
    }

    return Array.from(validLocations).sort((a, b) => a.localeCompare(b));
  }, [villas, budget, rentalType]);

  // Reset invalid selection
  useEffect(() => {
    if (selectedLocation && !availableLocations.includes(selectedLocation)) {
      setSelectedLocation('');
    }
  }, [availableLocations, selectedLocation]);

  // Filtering
  const filtered = useMemo(() => {
    const list = Array.isArray(villas) ? villas : [];
    return list.filter((v) => {
      if (budget) {
        const m = monthlyFromVilla(v);
        if (!(typeof m === 'number' && m <= budget)) return false;
      }
      if (selectedLocation) {
        const loc = readString(v, ['location', 'city', 'destination']) || '';
        if (loc !== selectedLocation) return false;
      }
      if (rentalType !== 'any') {
        const { hasWinter, hasSummer, hasAnnual } = availability(v);
        if (
          (rentalType === 'winter' && !hasWinter) ||
          (rentalType === 'summer' && !hasSummer) ||
          (rentalType === 'yearly' && !hasAnnual)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [villas, budget, selectedLocation, rentalType]);

  // About via hash
  useEffect(() => {
    const apply = () => {
      const wantAbout = window.location.hash.toLowerCase() === '#about';
      setShowAbout(wantAbout);
      if (wantAbout && aboutRef.current) {
        aboutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  const openAbout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowAbout(true);
    const url = new URL(window.location.href);
    url.hash = 'about';
    window.history.replaceState({}, '', url.toString());
    setTimeout(() => {
      aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  /* ---------- UI ---------- */

  const PriceChip = ({
    label,
    value,
    tone = 'slate',
  }: {
    label: string;
    value?: number;
    tone?: 'gold' | 'slate';
  }) => {
    if (typeof value !== 'number') return null;
    const base =
      'inline-flex items-center rounded-full whitespace-nowrap px-2.5 py-1 text-xs font-medium';
    const cls =
      tone === 'gold'
        ? `${base} bg-[#C6A36C]/15 text-[#6f5834] ring-1 ring-[#C6A36C]/30`
        : `${base} bg-slate-100 text-slate-800 ring-1 ring-slate-200`;
    return (
      <span className={cls}>
        <strong className="mr-1">{label}</strong> {eur0(value)} / month
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Move2Ibiza — Exclusive long-term rentals in Ibiza</title>
      </Head>

      <SiteHeaderHero />

      {/* HERO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center bg-black">
        <Image
          src="/es-vedra-hero.jpg"
          alt="Ibiza coastline"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="relative z-10 text-white">
          <div className="text-xl sm:text-3xl tracking-wide font-sans mb-3">
            Move2Ibiza
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold">
            Exclusive long-term rentals in Ibiza
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Selected villas and apartments for those who want to call Ibiza home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="#grid"
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-slate-900"
              style={{ background: '#C6A36C' }}
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

      {/* SEARCH + GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12" id="grid">
        <form
          className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10"
          onSubmit={(e) => e.preventDefault()}
        >
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="">All locations</option>
            {availableLocations.map((loc) => (
              <option value={loc} key={loc}>
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
          />

          <select
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value as RentalType)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="any">Any rental type</option>
            <option value="winter">Winter rental</option>
            <option value="summer">Summer rental</option>
            <option value="yearly">Yearly rental</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-[#C6A36C] px-4 py-3 font-semibold text-slate-900"
          >
            Search
          </button>
        </form>

        {/* Auto-fitting grid (centers single item) */}
        <div
          className={`
            grid gap-6
            [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]
            ${filtered.length === 1 ? 'max-w-3xl mx-auto' : ''}
          `}
        >
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 col-span-full">
              No properties match your filters.
            </p>
          ) : (
            filtered.map((v) => {
              const slug = getSlug(v);
              const href = slug ? `/v/${slug}` : undefined;
              const { hasWinter, hasSummer, hasAnnual } = availability(v);

              // prices (per month, pulled like the villa page)
              const y = priceYearly(v);
              const s = priceSummer(v);
              const w = priceWinter(v);

              const title = readString(v, ['title', 'name']) || 'Untitled';
              const location =
                readString(v, ['location', 'city', 'destination']) || '';

              const bedrooms = getBedrooms(v);
              const bathrooms = getBathrooms(v);

              const CardInner = (
                <>
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={v.cover || v.image || '/placeholder.jpg'}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-lg font-semibold text-slate-900">
                      {href ? (
                        <Link href={href} className="hover:underline underline-offset-4">
                          {title}
                        </Link>
                      ) : (
                        title
                      )}
                    </h3>

                    {location && (
                      <p className="text-sm text-slate-600">{location}</p>
                    )}

                    {/* Price chips */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {hasAnnual && <PriceChip label="Yearly" value={y} tone="gold" />}
                      {hasSummer && <PriceChip label="Summer" value={s} />}
                      {hasWinter && <PriceChip label="Winter" value={w} />}
                      {!hasAnnual && !hasSummer && !hasWinter && (
                        <span className="text-sm text-slate-400">Price on request</span>
                      )}
                    </div>

                    {/* Icons + words (only if we have at least one value) */}
                    {(typeof bedrooms === 'number' || typeof bathrooms === 'number') && (
                      <div className="mt-2 flex items-center gap-6 text-sm text-slate-700">
                        {typeof bedrooms === 'number' && (
                          <span className="inline-flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M3 7h18M6 7v7m12-7v7M3 14h18v3H3z" strokeWidth="1.5" />
                            </svg>
                            <span className="whitespace-nowrap">{bedrooms} bedrooms</span>
                          </span>
                        )}
                        {typeof bathrooms === 'number' && (
                          <span className="inline-flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M7 10V6a2 2 0 1 1 4 0v4m7 0H4v5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-5Z" strokeWidth="1.5" />
                            </svg>
                            <span className="whitespace-nowrap">{bathrooms} bathrooms</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );

              return (
                <div
                  key={slug || title}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  {href ? <Link href={href} className="block">{CardInner}</Link> : CardInner}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        ref={aboutRef as any}
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 transition-opacity duration-200 ${
          showAbout ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'
        }`}
      >
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">
          About Move2Ibiza
        </h2>
        <div className="mt-4 text-slate-700 leading-relaxed space-y-4">
          <p>
            At Move2Ibiza, we curate a handpicked selection of exclusive villas and apartments
            designed for those seeking more than a stay — a lifestyle. Our mission is to make
            your transition to island living effortless, combining exceptional properties with
            discreet, end-to-end support.
          </p>
          <p>
            With deep local knowledge and a trusted network built over years in Ibiza’s real
            estate market, we help you find not just a home, but the right fit for your life here.
            From first viewing to settling in, every detail is managed with precision,
            privacy, and care.
          </p>
          <p>
            <strong>Move2Ibiza — where relocation meets refinement.</strong>
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">
          Contact us
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          <strong>Moving to Ibiza begins with a conversation.</strong>
          <br />
          Whether you’re searching for a villa, an apartment, or simply exploring your options,
          our team is here to guide you. We value privacy, clarity, and personal attention —
          every enquiry is handled with care and discretion.
          <br />
          <br />
          Let’s find your place in Ibiza.
          <br />
          📧 <a href="mailto:M2Ibiza@inveniohomes.com" className="underline">M2Ibiza@inveniohomes.com</a>
          <br />
          📞 <a href="tel:+34671349592" className="underline">+34 671 349 592</a>
        </p>
        <form
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <input name="name" placeholder="Name" className="rounded-xl border border-slate-200 px-4 py-3" required />
          <input name="email" type="email" placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-3" required />
          <input name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" />
          <textarea name="message" rows={5} placeholder="Message" className="rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2" required />
          <button
            type="submit"
            className="mt-2 w-fit rounded-full px-5 py-3 font-semibold"
            style={{ background: '#C6A36C', color: '#1f2937' }}
          >
            Send inquiry
          </button>
        </form>
      </section>
    </>
  );
}
