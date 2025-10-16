import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const BASE   = process.env.INVENIO_API_BASE || "";
  const APIKEY = (process.env.INVENIO_API_KEY || "").trim();
  const UUID   = (process.env.INVENIO_BP_UUID || "").trim();
  res.status(200).json({
    base: BASE,
    apiKeySet: APIKEY ? true : false,
    bpUuidSet: UUID ? true : false,
  });
}
