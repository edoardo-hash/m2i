// pages/api/compute-monthly.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { monthlyFromVilla, availability } from "../../lib/pricing";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload = req.method === "POST" ? req.body : req.query;
    const monthly = monthlyFromVilla(payload);
    const avail = availability(payload);
    res.status(200).json({ monthly, availability: avail });
  } catch (e: any) {
    res.status(400).json({ error: e?.message || "Bad Request" });
  }
}