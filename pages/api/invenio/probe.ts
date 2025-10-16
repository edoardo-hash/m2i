import type { NextApiRequest, NextApiResponse } from "next";

const BASE   = (process.env.INVENIO_API_BASE || "").replace(/\/+$/,"");
const APIKEY = (process.env.INVENIO_API_KEY || "").trim();
const UUID   = (process.env.INVENIO_BP_UUID || "").trim();

const baseUrl = `${BASE}/plapi/getdata/api_villa_list_lr`;

const makeForm = () =>
  new URLSearchParams({ param: JSON.stringify([{ season_filter: "all" }]) });

const variants: Array<{ name: string; url: string; init: RequestInit }> = [
  {
    name: "form:param=... (api-key/bp_uuid)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "api-key": APIKEY,
        "bp_uuid": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: makeForm(),
    },
  },
  {
    name: "json:{param:[...]} (api-key/bp_uuid)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "api-key": APIKEY,
        "bp_uuid": UUID,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ param: [{ season_filter: "all" }] }),
    },
  },
  {
    name: "form + API-KEY/BP_UUID (upper-case)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "API-KEY": APIKEY,
        "BP_UUID": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: makeForm(),
    },
  },
  // NEW: hyphen variant
  {
    name: "form (api-key/bp-uuid)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "api-key": APIKEY,
        "bp-uuid": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: makeForm(),
    },
  },
  // NEW: x-api-key header
  {
    name: "form (x-api-key/bp_uuid)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "x-api-key": APIKEY,
        "bp_uuid": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: makeForm(),
    },
  },
  // NEW: both hyphen + x- prefix
  {
    name: "form (x-api-key/bp-uuid)",
    url: baseUrl,
    init: {
      method: "POST",
      headers: {
        "x-api-key": APIKEY,
        "bp-uuid": UUID,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: makeForm(),
    },
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!BASE || !APIKEY || !UUID) {
    return res.status(500).json({ error: "Missing envs", BASE, APIKEY: !!APIKEY, UUID: !!UUID });
  }
  const out: any[] = [];
  for (const v of variants) {
    try {
      const r = await fetch(v.url, v.init);
      const t = await r.text();
      out.push({ variant: v.name, ok: r.ok, status: r.status, body: t.slice(0, 800) });
    } catch (e: any) {
      out.push({ variant: v.name, error: e?.message || String(e) });
    }
  }
  res.status(200).json({ base: BASE, results: out });
}
