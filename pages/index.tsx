// pages/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";

type Season = "all" | "annual" | "summer" | "winter";

type Card = {
  title: string;
  destination?: string;
  city?: string;
  cover: string;
  slug: string;
  meta?: {
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    prices?: { annual?: string; summer?: string; winter?: string };
    updated?: string;
  };
};

// Ibiza is the only destination we support on Move2Ibiza
const DEST = "ibiza";

export default function Home() {
  // UI filters
  const [season, setSeason] = useState<Season>("all");
  const [minRent, setMinRent] = useState<number | "">("");
  const [maxRent, setMaxRent] = useState<number | "">("");
  const [beds, setBeds] = useState<number>(3);

  // Data
  const [villas, setVillas] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("dest", DEST);               // ← Ibiza only
    p.set("season", season);
    p.set("ts", Date.now().toString());
    return p.toString();
  }, [season]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/invenio/villas?${query}`);
        const j = await r.json();
        if (!r.ok || !j?.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        if (!cancel) setVillas(j.villas || []);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "Failed to load");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [query]);

  // client-side filter
  const filtered = useMemo(() => {
    const priceKey: "annual" | "summer" | "winter" = season === "all" ? "annual" : season;
    const num = (v?: string) => Number(String(v || "0").replace(/[^\d.]/g, "")) || 0;
    return villas.filter(v => {
      const bdOk = beds ? (v.meta?.bedrooms || 0) >= beds : true;
      const price = num(v.meta?.prices?.[priceKey]);
      const minOk = minRent === "" ? true : price >= (minRent as number);
      const maxOk = maxRent === "" ? true : price <= (maxRent as number);
      return bdOk && minOk && maxOk;
    });
  }, [villas, beds, minRent, maxRent, season]);

  return (
    <>
      <Head>
        <title>Move2Ibiza — Long-term villas in Ibiza</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Top bar */}
      <nav style={sx.nav}>
        <div style={sx.navInner}>
          <div style={sx.brand}><div style={sx.dot} />Move2Ibiza</div>
          <div style={sx.links}>
            <a href="#search" style={sx.link}>Start your search</a>
            <a href="#featured" style={sx.link}>Featured</a>
            <a href="#faq" style={sx.link}>FAQs</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={sx.hero}>
        <div style={sx.heroInner}>
          <div>
            <h1 style={sx.h1}>Long-term luxury villas<br/>in Ibiza.</h1>
            <p style={sx.lead}>Curated stays for 6–24 months. Discreet, end-to-end service.</p>
            <a href="#search" style={sx.cta}>Explore villas</a>
          </div>

          {/* Search card (Ibiza only) */}
          <div id="search" style={sx.card}>
            <h3 style={{ margin: "0 0 12px" }}>Start your search</h3>

            <div style={sx.row2}>
              <div style={{ flex: 1 }}>
                <label style={sx.label}>Season</label>
                <select value={season} onChange={e => setSeason(e.target.value as Season)} style={sx.select}>
                  <option value="all">All (long rental)</option>
                  <option value="annual">Annual</option>
                  <option value="summer">Summer</option>
                  <option value="winter">Winter</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={sx.label}>Bedrooms</label>
                <select value={beds} onChange={e => setBeds(Number(e.target.value))} style={sx.select}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div style={sx.row2}>
              <div style={{ flex: 1 }}>
                <label style={sx.label}>Min rent (€)</label>
                <input inputMode="numeric" value={minRent} onChange={e => setMinRent(e.target.value === "" ? "" : Number(e.target.value))} placeholder="8000" style={sx.input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={sx.label}>Max rent (€)</label>
                <input inputMode="numeric" value={maxRent} onChange={e => setMaxRent(e.target.value === "" ? "" : Number(e.target.value))} placeholder="30000" style={sx.input} />
              </div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 6 }}>Location: <strong>Ibiza</strong></div>
          </div>
        </div>
      </header>

      {/* Results */}
      <main id="featured" style={sx.main}>
        <h2 style={{ margin: "0 0 12px" }}>Featured villas</h2>
        {loading && <p style={sx.muted}>Loading…</p>}
        {error && <p style={{ ...sx.muted, color: "crimson" }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && <p style={sx.muted}>No villas match your filters.</p>}

        <div style={sx.grid}>
          {filtered.map(v => (
            <Link key={v.slug} href={`/v/${v.slug}`} style={sx.cardLink}>
              <div style={sx.cardImgWrap}>
                <img src={v.cover} alt={v.title} loading="lazy" style={sx.cardImg} />
                <span style={sx.badge}>{v.city || "Ibiza"}</span>
              </div>
              <div style={sx.cardBody}>
                <h3 style={sx.cardTitle}>{v.title}</h3>
                <p style={sx.cardMeta}>
                  {[
                    v.meta?.bedrooms ? `${v.meta.bedrooms} bd` : null,
                    v.meta?.bathrooms ? `${v.meta.bathrooms} ba` : null,
                    v.meta?.guests ? `${v.meta.guests} guests` : null,
                  ].filter(Boolean).join(" · ")}
                </p>
                {v.meta?.prices && (
                  <p style={sx.cardPrice}>
                    {season === "all"
                      ? (v.meta.prices.annual ? `Annual: ${v.meta.prices.annual}` : "—")
                      : (v.meta.prices[season] || "—")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer style={sx.footer}>
        <small style={{ opacity: 0.7 }}>Ibiza only · Data via Invenio Homes</small>
      </footer>
    </>
  );
}

const sx: Record<string, React.CSSProperties> = {
  nav: { borderBottom: "1px solid #eef0f2", background: "#fff" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", gap: 10, alignItems: "center", fontWeight: 700 },
  dot: { width: 16, height: 16, borderRadius: 4, background: "#111827" },
  links: { display: "flex", gap: 18, fontSize: 14 },
  link: { color: "#111827", textDecoration: "none", opacity: 0.85 },

  hero: { background: "linear-gradient(135deg,#f6f9fc 0%,#fff 60%)" },
  heroInner: { maxWidth: 1200, margin: "0 auto", padding: "48px 20px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 28 },
  h1: { fontSize: 56, lineHeight: 1.1, margin: "20px 0 12px", letterSpacing: -0.5 },
  lead: { fontSize: 18, opacity: 0.75, maxWidth: 560, marginBottom: 18 },
  cta: { display: "inline-block", background: "#111827", color: "#fff", padding: "10px 16px", borderRadius: 10, textDecoration: "none", fontWeight: 600 },

  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  label: { fontSize: 12, opacity: 0.7 },
  input: { height: 40, padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb", outline: "none" },
  select: { height: 40, padding: "8px 12px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", outline: "none" },

  main: { maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" },
  muted: { opacity: 0.6 },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 },
  cardLink: { display: "block", border: "1px solid #eef0f2", borderRadius: 16, overflow: "hidden", textDecoration: "none", color: "inherit", background: "#fff", boxShadow: "0 3px 12px rgba(0,0,0,0.04)" },
  cardImgWrap: { position: "relative", height: 200, overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover" },
  badge: { position: "absolute", left: 10, bottom: 10, background: "rgba(17,24,39,.8)", color: "#fff", padding: "3px 8px", borderRadius: 8, fontSize: 12 },
  cardBody: { padding: 12 },
  cardTitle: { margin: "0 0 8px", fontSize: 16 },
  cardMeta: { margin: 0, opacity: 0.7, fontSize: 13 },
  cardPrice: { margin: "8px 0 0", fontWeight: 600 },

  footer: { borderTop: "1px solid #eef0f2", textAlign: "center", padding: "16px 20px", background: "#fff" },
};
