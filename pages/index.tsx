// pages/index.tsx
'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { availability, eur0, monthlyFromVilla } from '../lib/pricing';

type Villa = any;
const getSlug = (v: Villa): string | undefined =>
  v?.slug || v?.id || v?._id || v?.airtableId;

type RentalType = 'any' | 'winter' | 'summer' | 'yearly';

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

  // Budget debounce
  useEffect(() => {
    const id = setTimeout(() => {
      const n = Number(String(budgetRaw).replace(/[^\d.]/g, ''));
      setBudget(Number.isFinite(n) && n > 0 ? n : undefined);
    }, 250);
    return () => clearTimeout(id);
  }, [budgetRaw]);

  // Locations for dropdown
  const availableLocations = useMemo(() => {
    const pool = villas;
    const setLoc = new Set<string>();
    for (const v of pool) {
      const loc = (v.location || v.city || v.destination || '').trim();
      if (loc) setLoc.add(loc);
    }
    return Array.from(setLoc).sort((a, b) => a.localeCompare(b));
  }, [villas]);

  // Reset invalid selection
  useEffect(() => {
    if (selectedLocation && !availableLocations.includes(selectedLocation)) {
      setSelectedLocation('');
    }
  }, [availableLocations, selectedLocation]);

  // --- Filtering logic
  const filtered = useMemo(() => {
    const list = Array.isArray(villas) ? villas : [];
    return list.filter((v) => {
      // Budget filter
      if (budget) {
        const m = monthlyFromVilla(v);
        if (!(typeof m === 'number' && m <= budget)) return false;
      }

      // Location
      if (selectedLocation) {
        const loc = (v.location || v.city || v.destination || '').trim();
        if (loc !== selectedLocation) return false;
      }

      // Rental type
      if (rentalType !== 'any') {
        const { hasWinter, hasSummer, hasAnnual } = availability(v);
        if (
          (rentalType === 'winter' && !hasWinter) ||
          (rentalType === 'summer' && !hasSummer) ||
          (rentalType === 'yearly' && !hasAnnual)
        )
          return false;
      }

      return true;
    });
  }, [villas, budget, selectedLocation, rentalType]);

  // About toggle via hash
  useEffect(() => {
    const applyHash = () => {
      const wantAbout = window.location.hash.toLowerCase() === '#about';
      setShowAbout(wantAbout);
      if (wantAbout && aboutRef.current) {
        aboutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const openAbout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setShowAbout(true);
    const url = new URL(window.location.href);
    url.hash = 'about';
    window.history.replaceState({}, '', url.toString());
    setTimeout(
      () => aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      0
    );
  };

  return (
    <>
      <Head>
        <title>Move2Ibiza — Exclusive long-term rentals in Ibiza</title>
      </Head>

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

      {/* Floating Contact Button */}
      <a
        href="#contact"
        className="fixed left-4 bottom-4 z-40 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-slate-800 shadow ring-1 ring-black/10 hover:bg-white"
      >
        Contact
      </a>

      {/* SEARCH + GRID */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12" id="grid">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 col-span-full">
              No properties match your filters.
            </p>
          ) : (
            filtered.map((v) => {
              const slug = getSlug(v);
              const href = slug ? `/v/${slug}` : undefined;
              const m = monthlyFromVilla(v);
              const { hasWinter, hasSummer, hasAnnual } = availability(v);

              const CardInner = (
                <>
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={v.cover || v.image || '/placeholder.jpg'}
                      alt={v.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-serif text-lg font-semibold text-slate-900">
                      {href ? (
                        <Link href={href} className="hover:underline underline-offset-4">
                          {v.title}
                        </Link>
                      ) : (
                        v.title
                      )}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {v.location || v.city || v.destination}
                    </p>
                    {typeof m === 'number' && (
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
                </>
              );

              return (
                <div
                  key={slug || v.title}
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
        className={`mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 transition-opacity duration-200 ${
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
      <section id="contact" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900">
          Contact us
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          <strong>Moving to Ibiza begins with a conversation.</strong><br />
          Whether you’re searching for a villa, an apartment, or simply exploring your options,
          our team is here to guide you. We value privacy, clarity, and personal attention — every
          enquiry is handled with care and discretion.
          <br /><br />
          Let’s find your place in Ibiza.<br />
          📧 <a href="mailto:M2Ibiza@inveniohomes.com" className="underline">M2Ibiza@inveniohomes.com</a><br />
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
          <button type="submit" className="mt-2 w-fit rounded-full px-5 py-3 font-semibold" style={{ background: '#C6A36C', color: '#1f2937' }}>
            Send inquiry
          </button>
        </form>
      </section>
    </>
  );
}
