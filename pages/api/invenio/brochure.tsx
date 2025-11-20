// pages/api/invenio/brochure.tsx
import React from "react";
import type { NextApiRequest, NextApiResponse } from "next";
import { Document, Page, Text, View, Image, StyleSheet, pdf } from "@react-pdf/renderer";

export const config = { api: { bodyParser: false } };

/* ===== Theme ===== */
const INK   = "#111827";
const MUTED = "#6B7280";
const HAIR  = "#E5E7EB";
const GOLD  = "#C6A36C";

/* ===== Styles ===== */
const styles = StyleSheet.create({
  page: { padding: 28, fontFamily: "Helvetica", fontSize: 11, color: INK },

  /* Hero */
  hero: { position: "relative", height: 260, borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  heroImg: { position: "absolute", inset: 0, objectFit: "cover" },
  heroShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 110, backgroundColor: "rgba(0,0,0,0.28)" },
  heroText: { position: "absolute", left: 18, right: 18, bottom: 14 },
  hTitle: { fontSize: 22, fontWeight: 700, color: "#fff" },
  hSub:   { marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.95)" },
  hair: { height: 1, backgroundColor: GOLD, opacity: 0.9, marginTop: 6 },

  factsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  factPill: {
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.65)", color: "#fff",
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, marginRight: 8, marginBottom: 6,
  },

  /* Header fallback (no hero) */
  headWrap: { marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: 700 },
  sub: { fontSize: 11, color: MUTED },
  hairLight: { height: 1, backgroundColor: GOLD, opacity: 0.9, marginTop: 6, marginBottom: 2 },

  /* Columns */
  row: { flexDirection: "row" },
  left: { width: 360, paddingRight: 16 },
  right:{ width: 170, paddingLeft: 12 },

  h2: { fontSize: 13.5, fontWeight: 700, marginBottom: 8 },
  h3: { fontSize: 12, fontWeight: 700, marginBottom: 6 },

  para: { lineHeight: 1.58, textAlign: "left", color: INK },

  card: { borderWidth: 0.5, borderColor: HAIR, borderRadius: 10, backgroundColor: "#fff", padding: 12, marginBottom: 10 },

  hlItem: { flexDirection: "row", marginBottom: 6 },
  bullet: { width: 12, textAlign: "center", color: GOLD, fontSize: 12 },
  hlText: { flex: 1, fontSize: 11 },

  location: { marginTop: 12 },

  /* Gallery (2×2 large tiles, manual margins — no gap) */
  galleryWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  gImg: { width: 244, height: 164, objectFit: "cover", borderRadius: 10, marginBottom: 8 },
  gImgMR: { marginRight: 8 },

  /* Footer */
  foot: { position: "absolute", bottom: 20, left: 28, right: 28, fontSize: 9, color: MUTED, textAlign: "center" },
});

/* ===== Helpers ===== */
type Photo = string | { url?: string; src?: string };
const S = (x: any) => (x == null ? "" : String(x));
const stripHtml = (html: any) => S(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const srcOf = (p?: Photo) => (typeof p === "string" ? p : p?.url || p?.src || "");

const isGoodImg = (u?: string) =>
  !!u && /^https?:\/\//i.test(u) && /\.(jpe?g|png|webp)(\?|#|$)/i.test(u);

const abs = (u: string | undefined, origin: string) => {
  if (!u) return;
  if (/^https?:\/\//i.test(u)) return u;
  if (/^\/\//.test(u)) return `https:${u}`;
  if (/^\//.test(u)) return `${origin}${u}`;
  return;
};

const collectImages = (villa: any, origin: string): string[] => {
  const raw = [
    srcOf(villa?.cover),
    srcOf(villa?.profile_picture),
    ...(Array.isArray(villa?.images) ? villa.images.map(srcOf) : []),
    ...(Array.isArray(villa?.photos) ? villa.photos.map(srcOf) : []),
    ...(Array.isArray(villa?.gallery) ? villa.gallery.map(srcOf) : []),
    ...(Array.isArray(villa?.thumb_images) ? villa.thumb_images.map(srcOf) : []),
  ];
  const urls = raw.map((u) => abs(u, origin)).filter(isGoodImg) as string[];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) if (!seen.has(u)) { seen.add(u); unique.push(u); }
  return unique;
};

const facts = (v: any) => {
  const b = v?.meta?.bedrooms ?? v?.bedrooms;
  const ba = v?.meta?.bathrooms ?? v?.bathrooms;
  const g = v?.meta?.guests ?? v?.guests ?? v?.meta?.guestsMax;
  return [b && `${b} Bedrooms`, ba && `${ba} Bathrooms`, g && `${g} Guests`].filter(Boolean) as string[];
};

const prices = (v: any) =>
  [
    { label: "Annual", value: v?.priceAnnual || v?.pricing?.annual || v?.price?.annual },
    { label: "Summer", value: v?.pricing?.summer || v?.price?.summer },
    { label: "Winter", value: v?.pricing?.winter || v?.price?.winter },
  ].filter((x) => x.value);

const highlights = (v: any) => {
  const arr = (Array.isArray(v?.amenities) ? v.amenities : []) as Array<string | { name?: string; label?: string }>;
  const names = arr
    .map((a) => (typeof a === "string" ? a : a?.name || a?.label || ""))
    .map((s) => s.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  return names.filter((n) => (seen.has(n) ? false : (seen.add(n), true))).slice(0, 26);
};

const paginate = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/* ===== Document ===== */
function Brochure({ villa, origin }: { villa: any; origin: string }) {
  const title  = S(villa?.title || villa?.bp_name || villa?.name || "Property");
  const loc    = [villa?.destination, villa?.city, villa?.location].filter(Boolean).join(" · ");
  const lat    = (villa?.coords?.lat ?? villa?.lat) as number | undefined;
  const lng    = (villa?.coords?.lng ?? villa?.lng) as number | undefined;

  const imgs = collectImages(villa, origin);
  const hero = imgs[0];
  const gallery = imgs.slice(1).slice(0, 8); // <= only 8 best images

  const f  = facts(villa);
  const pr = prices(villa);
  const hl = highlights(villa);
  const desc = stripHtml(villa?.description);

  const galleryPages = paginate(gallery, 4); // 2×2 per page

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {hero ? (
          <View style={styles.hero}>
            <Image src={hero} style={styles.heroImg} />
            <View style={styles.heroShade} />
            <View style={styles.heroText}>
              <Text style={styles.hTitle}>{title}</Text>
              {loc ? <Text style={styles.hSub}>{loc}</Text> : null}
              <View style={styles.hair} />
              {f.length ? (
                <View style={styles.factsRow}>
                  {f.map((x, i) => <Text key={i} style={styles.factPill}>{x}</Text>)}
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.headWrap}>
            <Text style={styles.h1}>{title}</Text>
            {loc ? <Text style={styles.sub}>{loc}</Text> : null}
            <View style={styles.hairLight} />
            {f.length ? <Text style={styles.sub}>{f.join("   •   ")}</Text> : null}
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.h2}>Overview</Text>
            <Text style={styles.para}>{desc || "Property details available on request."}</Text>

            {(loc || (lat && lng)) && (
              <View style={styles.location}>
                <Text style={[styles.h3, { marginTop: 14 }]}>Location</Text>
                {loc ? <Text style={styles.para}>{loc}</Text> : null}
                {lat && lng ? (
                  <Text style={[styles.sub, { marginTop: 6 }]}>
                    Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          <View style={styles.right}>
            {hl.length ? (
              <View style={styles.card}>
                <Text style={styles.h3}>Highlights</Text>
                <View style={{ marginTop: 4 }}>
                  {hl.map((t, i) => (
                    <View key={i} style={styles.hlItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.hlText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {pr.length ? (
              <View style={styles.card}>
                <Text style={styles.h3}>Pricing</Text>
                {pr.map((p, i) => (
                  <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={styles.sub}>{p.label}</Text>
                    <Text>{S(p.value)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.foot} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
      </Page>

      {galleryPages.map((group, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          <Text style={styles.h2}>Gallery</Text>
          <View style={styles.galleryWrap}>
            {group.map((src, i) => (
              <Image
                key={i}
                src={src}
                style={[styles.gImg, i % 2 === 0 ? styles.gImgMR : {}]} // manual right margin
              />
            ))}
          </View>
          <Text style={styles.foot} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </Page>
      ))}
    </Document>
  );
}

/* ===== API ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = String(req.query.slug || "").trim();
  if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const host = req.headers.host!;
  const origin = `${proto}://${host}`;

  const r = await fetch(`${origin}/api/invenio/villa?slug=${encodeURIComponent(slug)}`);
  if (!r.ok) return res.status(502).json({ ok: false, error: `Villa API ${r.status}` });

  const data = await r.json();
  const villa = (data && (data.villa || data)) || null;
  if (!villa) return res.status(404).json({ ok: false, error: "Villa not found" });

  const doc = <Brochure villa={villa} origin={origin} />;
  const file = await pdf(doc).toBuffer();

  const safeName = String(villa?.title || slug)
    .replace(/[^a-z0-9]+/gi, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "").toLowerCase();
  const filename = `brochure-${safeName}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("X-Brochure-Version", "v11");
  res.status(200).send(file);
}
