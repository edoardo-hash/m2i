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
  villa_images?: string[];
  pt_last_updated_on?: string;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  built_size?: string;
  plot_size?: string;
  annual_price?: string;
  summer_price?: string;
  winter_price?: string;
  description?: string;
  bp_profile?: string;
  features?: string[];
  gps?: string; // "lat,lng"
};

type LRResponse = Array<{ result?: LRVilla[]; total_count?: number }>;

const isAbs = (u?: string) => !!u && /^(https?:)?\/\//i.test(u);

// Treat anything containing 'thumb', 'thmb', or '_thumb' as a low-res asset
const isThumbUrl = (u?: string) => !!u && /(thumb|thmb|_thumb)/i.test(u || "");

// Gather, dedupe, and sort so non-thumbs come first
function gatherImages(v: LRVilla): string[] {
  const set = new Set<string>();
  const buckets = [
    ...(v.villa_images || []), // often highest res → prefer first
    ...(v.photos || []),
    v.profile_picture || "",
    ...(v.thumb_images || []),
  ];
  buckets.filter(isAbs).forEach(u => set.add(u!));
  return Array.from(set).sort((a, b) => Number(isThumbUrl(a)) - Number(isThumbUrl(b)));
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
function makeSlug(v: LRVilla) {
  const title = v.bp_name?.trim() || "villa";
  return slugify(`${title}-${v.bp_uuid || v.bp_id || ""}`);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!BASE || !APIKEY || !UUID) {
      return res.status(500).json({ ok: false, error: "Missing API configuration" });
    }

    const slug = String(req.query.slug || "").trim();
    const season = (String(req.query.season || "all").toLowerCase() as Season);
    if (!slug) return res.status(400).json({ ok: false, error: "Missing slug" });

    const url = `${BASE}/plapi/getdata/api_villa_list_lr`;
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
    const list: LRVilla[] = Array.isArray(data) && data.length ? (data[0].result ?? []) : [];

    const match = list.find((v) => makeSlug(v) === slug);
    if (!match) return res.status(404).json({ ok: false, error: "Villa not found" });

    // Parse GPS "lat,lng"
    let coords: { lat: number; lng: number } | undefined;
    if (match.gps && match.gps.includes(",")) {
      const [a, b] = match.gps.split(",").map((s) => Number(s.trim()));
      if (Number.isFinite(a) && Number.isFinite(b)) coords = { lat: a, lng: b };
    }

    const images = gatherImages(match);
    const cover = images[0] || "";

    return res.status(200).json({
      ok: true,
      season,
      villa: {
        title: match.bp_name,
        destination: match.destination,
        city: match.city,
        cover,
        images,
        slug,
        meta: {
          bedrooms: match.bedrooms,
          bathrooms: match.bathrooms,
          guests: match.guests,
          builtSize: match.built_size,
          plotSize: match.plot_size,
          prices: {
            annual: match.annual_price,
            summer: match.summer_price,
            winter: match.winter_price,
          },
          updated: match.pt_last_updated_on,
        },
        description: match.description || match.bp_profile || "",
        coords,
        amenities: Array.isArray(match.features) ? match.features : [],
        raw: match,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
}
