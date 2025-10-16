import type { NextApiRequest, NextApiResponse } from "next";

const BASE   = (process.env.INVENIO_API_BASE || "").replace(/\/+$/, "");
const APIKEY = (process.env.INVENIO_API_KEY ?? "").trim();
const UUID   = (process.env.INVENIO_BP_UUID ?? "").trim();

type Season = "all" | "annual" | "summer" | "winter";

type LRVilla = {
  bp_name?: string;
  bp_id?: number;
  bp_uuid?: string;
  destination?: string;
  city?: string;
  profile_picture?: string;
  photos?: string[];
  thumb_images?: string[];
  pt_last_updated_on?: string;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  annual_price?: string;
  summer_price?: string;
  winter_price?: string;
};

type LRResponse = Array<{ result?: LRVilla[]; total_count?: number }>;

function isAbs(u?: string) { return !!u && /^(https?:)?\/\//i.test(u); }
function firstImage(v: LRVilla) {
  if (v.profile_picture && isAbs(v.profile_picture)) return v.profile_picture;
  const fromPhotos = v.photos?.find(isAbs); if (fromPhotos) return fromPhotos;
  const fromThumbs = v.thumb_images?.find(isAbs); if (fromThumbs) return fromThumbs;
  return "";
}
function slugify(s: string) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!BASE || !APIKEY || !UUID) {
      return res.status(500).json({ ok: false, error: "Missing API configuration" });
    }

    const season = (String(req.query.season || "all").toLowerCase() as Season);
    const dest = String(req.query.dest || "").toLowerCase().trim();

    const url = `${BASE}/plapi/getdata/api_villa_list_lr`;

    // *** EXACTLY like your working cURL: form-encoded with data-urlencode 'param=[{...}]'
    const body = new URLSearchParams({
      param: JSON.stringify([{ season_filter: season }]),
    });

    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": APIKEY,
        "bp_uuid": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return res.status(502).json({ ok: false, error: `Upstream ${upstream.status}`, upstreamRaw: text.slice(0, 2000) });
    }

    const data = JSON.parse(text) as LRResponse;
    const list = Array.isArray(data) && data.length ? (data[0].result ?? []) : [];

    const filtered = dest
      ? list.filter(v => (v.destination || v.city || "").toLowerCase().includes(dest))
      : list;

    const cards = filtered.map(v => {
      const title = v.bp_name?.trim();
      const cover = firstImage(v);
      if (!title || !cover) return null;
      return {
        title,
        destination: v.destination,
        city: v.city,
        cover,
        slug: slugify(`${title}-${v.bp_uuid || v.bp_id || ""}`),
        meta: {
          bedrooms: v.bedrooms,
          bathrooms: v.bathrooms,
          guests: v.guests,
          prices: { annual: v.annual_price, summer: v.summer_price, winter: v.winter_price },
          updated: v.pt_last_updated_on,
        },
      };
    }).filter(Boolean);

    res.status(200).json({ ok: true, season, count: cards.length, villas: cards });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
}
