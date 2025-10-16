// pages/v/[slug].tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Types ---------- */

type Villa = {
  title: string;
  destination?: string;
  city?: string;
  cover: string;
  images: string[];
  slug: string;
  meta?: {
    bedrooms?: number;
    bathrooms?: number;
    guests?: number;
    builtSize?: string;
    plotSize?: string;
    prices?: { annual?: string; summer?: string; winter?: string };
    updated?: string;
  };
  description?: string;
  coords?: { lat: number; lng: number };
  amenities?: string[];
};

/* ---------- Utilities ---------- */

// OSM embed via bbox (reliable initial zoom)
function osmEmbedUrl(lat: number, lng: number, delta = { lat: 0.1, lng: 0.15 }) {
  const latS = lat - delta.lat;
  const latN = lat + delta.lat;
  const lngW = lng - delta.lng;
  const lngE = lng + delta.lng;
  const bbox = `${lngW},${latS},${lngE},${latN}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lng}`)}`;
}

const BRAND = "#133A49"; // Move2Ibiza navy

/* ---------- Page ---------- */

export default function VillaPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [villa, setVilla] = useState<Villa | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtered images (hide tiny ones)
  const [displayImages, setDisplayImages] = useState<string[]>([]);

  // Carousel & Lightbox
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState<{ open: boolean; i: number }>({ open: false, i: 0 });

  // Enquiry form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "fail">(null);

  // Sections (tabs)
  const refOverview = useRef<HTMLDivElement>(null);
  const refAmenities = useRef<HTMLDivElement>(null);
  const refLocation = useRef<HTMLDivElement>(null);
  const refGallery = useRef<HTMLDivElement>(null);

  // Load & prepare villa
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/invenio/villa?slug=${encodeURIComponent(String(slug))}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.ok) {
          setVilla(null);
          return;
        }
        const cover = data.villa.cover ? [data.villa.cover] : [];
        const rest = (data.villa.images || []).filter((u: string) => u !== data.villa.cover);
        const images: string[] = [...cover, ...rest];

        setVilla({ ...data.villa, images });
        if (data.villa.coords) setCoords(data.villa.coords);

        // Filter small images; if none pass, fall back to originals
        const big = await filterLargeImages(images, 900, 600);
        setDisplayImages(big.length ? big : images);
        setIdx(0);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox.open) {
        if (e.key === "Escape") setLightbox({ open: false, i: 0 });
        if (e.key === "ArrowLeft") setLightbox((s) => ({ ...s, i: s.i - 1 }));
        if (e.key === "ArrowRight") setLightbox((s) => ({ ...s, i: s.i + 1 }));
        return;
      }
      if (!displayImages?.length) return;
      if (e.key === "ArrowLeft") go(idx - 1);
      if (e.key === "ArrowRight") go(idx + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, displayImages, lightbox.open]);

  const go = (to: number) => {
    if (!displayImages?.length) return;
    const n = displayImages.length;
    setIdx(((to % n) + n) % n);
  };

  const m = villa?.meta || {};
  const priceLine = useMemo(() => {
    if (!m?.prices) return "";
    const parts = [
      m.prices.annual ? `Annual: ${m.prices.annual}` : "",
      m.prices.summer ? `Summer: ${m.prices.summer}` : "",
      m.prices.winter ? `Winter: ${m.prices.winter}` : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }, [m?.prices]);

  if (loading) return <p style={{ padding: 40 }}>Loading villa...</p>;
  if (!villa) return <p style={{ padding: 40, color: "crimson" }}>Villa not found</p>;

  /* ---------- Enquiry ---------- */
  async function submitEnquiry(e: React.FormEvent) {
    e.preventDefault();
    setSent(null);
    if (!name || !email || !message) {
      setSent("fail");
      alert("Please fill in name, email and message.");
      return;
    }
    setSending(true);
    try {
      const subject = `Move2Ibiza enquiry: ${villa.title}`;
      const body = [
        `Property: ${villa.title}`,
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
        `mailto:hello@move2ibiza.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        "_blank"
      );
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          villaSlug: villa.slug,
          villaTitle: villa.title,
          url: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      setSent("ok");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch {
      setSent("fail");
    } finally {
      setSending(false);
    }
  }

  // Helper: preload + filter images by size
  function filterLargeImages(urls: string[], minW = 900, minH = 600): Promise<string[]> {
    const loaders = urls.map(
      (src) =>
        new Promise<{ src: string; ok: boolean }>((resolve) => {
          const img = new Image();
          img.onload = () =>
            resolve({ src, ok: img.naturalWidth >= minW && img.naturalHeight >= minH });
          img.onerror = () => resolve({ src, ok: false });
          img.src = src;
        })
    );
    return Promise.all(loaders).then((arr) => arr.filter((x) => x.ok).map((x) => x.src));
  }

  // Tabs scroll
  const scrollTo = (el: HTMLDivElement | null) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>{villa.title} — Move2Ibiza</title>
        <meta name="description" content={`${villa.title} in ${villa.city || "Ibiza"} · ${priceLine}`} />
        <meta property="og:title" content={`${villa.title} — Move2Ibiza`} />
        <meta property="og:image" content={displayImages?.[0] || villa.images?.[0]} />
        <meta property="og:description" content={`${villa.title} in ${villa.city || "Ibiza"}.`} />
      </Head>

      {/* NAV */}
      <nav style={navWrap}>
        <div style={navInner}>
          <a href="/" style={brandLink}>
            <img
              src="/m2i-logo.jpg"
              alt="Move2Ibiza"
              style={{ height: 24, width: "auto", display: "block" }}
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
            <span style={{ fontWeight: 800, color: BRAND, marginLeft: 10 }}>Move2Ibiza</span>
          </a>
          <div style={{ display: "flex", gap: 18 }}>
            <a href="/" style={navA}>Home</a>
            <a href="/#featured" style={navA}>Featured</a>
          </div>
        </div>
      </nav>
      <div style={{ height: 60 }} />

      <div style={{ background: "#F7F7F6" }}>
        {/* Breadcrumbs */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 24px 0", fontSize: 13, opacity: 0.8 }}>
          <a href="/" style={{ color: BRAND, textDecoration: "none" }}>Home</a> {" / "}
          <span>Ibiza</span> {" / "}
          <span>{villa.city || "—"}</span> {" / "}
          <strong>{villa.title}</strong>
        </div>

        {/* HERO with gradient overlay */}
        <section style={{ maxWidth: 1280, margin: "8px auto 0", padding: "0 24px" }}>
          <div
            style={{
              position: "relative",
              height: 560,
              borderRadius: 18,
              overflow: "hidden",
              background: "#eaeaea",
              boxShadow: "0 20px 40px rgba(0,0,0,.06)",
              cursor: "zoom-in",
            }}
            onClick={() => setLightbox({ open: true, i: idx })}
          >
            {displayImages?.[idx] && (
              <img
                src={displayImages[idx]}
                alt={villa.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
              }}
            />
            <div style={{ position: "absolute", left: 20, bottom: 18, color: "#fff" }}>
              <h1 style={{ margin: 0, fontSize: 42, letterSpacing: 0.2 }}>{villa.title}</h1>
              <div
                style={{
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                  background: "rgba(0,0,0,0.5)",
                  padding: "6px 10px",
                  borderRadius: 999,
                  marginTop: 6,
                  fontSize: 13,
                }}
              >
                <span>📍 {villa.city || "Ibiza"}</span>
              </div>
            </div>
            {displayImages?.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); go(idx - 1); }} aria-label="Previous" style={navBtn("left")}>‹</button>
                <button onClick={(e) => { e.stopPropagation(); go(idx + 1); }} aria-label="Next" style={navBtn("right")}>›</button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {displayImages?.length > 1 && (
            <div
              style={{
                display: "grid",
                gridAutoFlow: "column",
                gap: 8,
                marginTop: 12,
                overflowX: "auto",
                paddingBottom: 6,
              }}
            >
              {displayImages.slice(0, 12).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox({ open: true, i })}
                  style={thumbBtn(i === idx)}
                  title="View larger"
                >
                  <img
                    src={src}
                    alt={`${villa.title} ${i + 1}`}
                    style={{ width: 130, height: 84, objectFit: "cover", borderRadius: 12, display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Tabs */}
        <div style={{ maxWidth: 1280, margin: "8px auto 0", padding: "0 24px" }}>
          <div style={tabsWrap}>
            <button onClick={() => scrollTo(refOverview.current)} style={tabBtn}>Overview</button>
            <button onClick={() => scrollTo(refAmenities.current)} style={tabBtn}>Amenities</button>
            <button onClick={() => scrollTo(refLocation.current)} style={tabBtn}>Location</button>
            <button onClick={() => scrollTo(refGallery.current)} style={tabBtn}>Gallery</button>
          </div>
        </div>

        {/* Content */}
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 24px 70px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.1fr", gap: 28 }}>
            {/* LEFT */}
            <div style={{ display: "grid", gap: 18 }}>
              <section ref={refOverview} style={card()}>
                <div style={factsRow}>
                  <Fact label="Bedrooms" value={num(m.bedrooms)} />
                  <Divider />
                  <Fact label="Bathrooms" value={num(m.bathrooms)} />
                  <Divider />
                  <Fact label="Guests" value={num(m.guests)} />
                  {m.builtSize ? <><Divider /><Fact label="Built" value={`${m.builtSize} m²`} /></> : null}
                  {m.plotSize ? <><Divider /><Fact label="Plot" value={`${m.plotSize} m²`} /></> : null}
                </div>
              </section>

              {villa.description && (
                <section style={card()}>
                  <h3 style={h3}>Description</h3>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{villa.description}</p>
                </section>
              )}

              {villa.amenities?.length ? (
                <section ref={refAmenities} style={card()}>
                  <h3 style={h3}>Amenities</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {villa.amenities.slice(0, 40).map((a, i) => (
                      <span key={i} style={chip}>{a}</span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section ref={refLocation} style={card()}>
                <h3 style={h3}>Location</h3>
                {coords ? (
                  <iframe
                    title="map"
                    style={{ width: "100%", height: 340, border: 0, borderRadius: 14 }}
                    src={osmEmbedUrl(coords.lat, coords.lng)}
                  />
                ) : (
                  <p style={{ margin: 0, opacity: 0.7 }}>Location unavailable</p>
                )}
                <p style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>Map powered by OpenStreetMap</p>
              </section>

              {displayImages?.length > 1 && (
                <section ref={refGallery} style={card()}>
                  <h3 style={h3}>Gallery</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
                      gap: 12,
                    }}
                  >
                    {displayImages.slice(1).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${villa.title} ${i + 2}`}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          borderRadius: 14,
                          border: "1px solid #eee",
                          cursor: "zoom-in",
                        }}
                        onClick={() => setLightbox({ open: true, i: i + 1 })}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT sticky enquiry */}
            <aside style={{ position: "sticky", top: 92, alignSelf: "start" }}>
              <section style={enqCard}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Enquire</h3>
                </div>
                {priceLine ? (
                  <p style={{ margin: "8px 0 14px", fontWeight: 700, color: BRAND }}>{priceLine}</p>
                ) : (
                  <p style={{ margin: "8px 0 14px", opacity: 0.75 }}>Contact for pricing</p>
                )}

                <form onSubmit={submitEnquiry} style={{ display: "grid", gap: 10 }}>
                  <input placeholder="Your name*" value={name} onChange={e => setName(e.target.value)} style={input} />
                  <input type="email" placeholder="Email*" value={email} onChange={e => setEmail(e.target.value)} style={input} />
                  <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} style={input} />
                  <textarea placeholder="Message*" rows={4} value={message} onChange={e => setMessage(e.target.value)} style={{ ...input, resize: "vertical" }} />
                  <button type="submit" disabled={sending} style={cta(BRAND)}>
                    {sending ? "Sending…" : "Request info"}
                  </button>
                  {sent === "ok" && <p style={{ margin: 0, color: "seagreen", fontSize: 13 }}>Thanks! We’ll get back to you shortly.</p>}
                  {sent === "fail" && <p style={{ margin: 0, color: "crimson", fontSize: 13 }}>Please fill all required fields (name, email, message).</p>}
                </form>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* Lightbox */}
      {lightbox.open && displayImages?.length ? (
        <div
          onClick={() => setLightbox({ open: false, i: 0 })}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.86)",
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <img
            src={
              displayImages[
                ((lightbox.i % displayImages.length) + displayImages.length) % displayImages.length
              ]
            }
            alt={villa.title}
            style={{
              maxWidth: "92vw",
              maxHeight: "86vh",
              objectFit: "contain",
              borderRadius: 10,
              boxShadow: "0 20px 60px rgba(0,0,0,.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(s => ({ ...s, i: s.i - 1 })); }}
            style={lbBtn("left")}
            aria-label="Previous image"
          >‹</button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(s => ({ ...s, i: s.i + 1 })); }}
            style={lbBtn("right")}
            aria-label="Next image"
          >›</button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox({ open: false, i: 0 }); }}
            aria-label="Close lightbox"
            style={lbClose}
          >×</button>
        </div>
      ) : null}
    </>
  );
}

/* ---------- UI atoms ---------- */

const navWrap: React.CSSProperties = {
  position: "fixed",
  top: 0, left: 0, right: 0,
  height: 60,
  background: "#fff",
  borderBottom: "1px solid #eef0f2",
  zIndex: 40,
};
const navInner: React.CSSProperties = {
  maxWidth: 1280, margin: "0 auto", height: "100%",
  padding: "0 24px",
  display: "flex", alignItems: "center", justifyContent: "space-between",
};
const brandLink: React.CSSProperties = { display: "flex", alignItems: "center", textDecoration: "none" };
const navA: React.CSSProperties = { color: "#111827", textDecoration: "none", opacity: 0.9, fontSize: 14 };

const tabsWrap: React.CSSProperties = {
  display: "flex",
  gap: 16,
  background: "#fff",
  border: "1px solid #EEF0F2",
  borderRadius: 999,
  padding: 6,
  width: "fit-content",
  boxShadow: "0 6px 18px rgba(0,0,0,.05)",
};
const tabBtn: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #EEF0F2",
  padding: "8px 14px",
  borderRadius: 999,
  cursor: "pointer",
  fontSize: 13,
};

const h3: React.CSSProperties = { margin: "0 0 10px", fontSize: 18 };

const chip: React.CSSProperties = {
  background: "#F3F4F6",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 13,
  border: "1px solid #E5E7EB",
};

function card(): React.CSSProperties {
  return {
    background: "#fff",
    border: "1px solid #EEF0F2",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  };
}
const enqCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #EEF0F2",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
};

const factsRow: React.CSSProperties = {
  display: "grid",
  gridAutoFlow: "column",
  alignItems: "center",
  justifyContent: "start",
  gap: 14,
  overflowX: "auto",
};

function Fact({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ minWidth: 110 }}>
      <div style={{ fontSize: 12, opacity: 0.65 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
    </div>
  );
}
function Divider() { return <div style={{ width: 1, height: 30, background: "#E5E7EB" }} />; }
function num(n?: number) { return typeof n === "number" ? n : "—"; }

function cta(color: string): React.CSSProperties {
  return {
    width: "100%",
    height: 46,
    background: color,
    color: "#fff",
    border: "1px solid " + color,
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
const input: React.CSSProperties = {
  height: 44,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  background: "#fff",
};

function navBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 12,
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontSize: 24,
    lineHeight: "42px",
    textAlign: "center",
  } as any;
}
function thumbBtn(active: boolean): React.CSSProperties {
  return {
    padding: 0,
    border: active ? "2px solid #133A49" : "2px solid transparent",
    borderRadius: 14,
    overflow: "hidden",
    cursor: "pointer",
    background: "transparent",
  };
}
function lbBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "fixed",
    top: "50%", transform: "translateY(-50%)",
    [side]: 26,
    width: 54, height: 54,
    background: "rgba(255,255,255,0.18)",
    color: "#fff", fontSize: 28, lineHeight: "54px",
    textAlign: "center",
    borderRadius: 14, border: "1px solid rgba(255,255,255,0.35)",
    cursor: "pointer", zIndex: 70,
  } as any;
}
const lbClose: React.CSSProperties = {
  position: "fixed", top: 18, right: 18, width: 46, height: 46,
  borderRadius: 14, border: "1px solid rgba(255,255,255,.4)",
  background: "rgba(255,255,255,.18)", color: "#fff",
  fontSize: 26, lineHeight: "46px", textAlign: "center",
  cursor: "pointer", zIndex: 80,
};
