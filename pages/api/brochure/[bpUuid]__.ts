// pages/api/brochure/[bpUuid].ts

import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import axios from "axios";

type InvenioVilla = {
  bp_name: string;
  bp_uuid: string;
  city?: string;
  destination?: string;
  areaname?: string;
  bathrooms?: number;
  bedrooms?: number;
  guests?: number;
  built_size?: string;
  plot_size?: string;
  description?: string;
  features?: string[];
  photos?: string[];
  bp_profile?: string;
  bp_lat?: string;
  bp_lng?: string;
};

async function fetchVillas(): Promise<InvenioVilla[]> {
  const apiKey = process.env.INVENIO_API_KEY;
  const partnerUuid = process.env.INVENIO_BP_UUID;
  const baseUrl = process.env.INVENIO_API_BASE || "https://api.inveniohomes.com";

  if (!apiKey || !partnerUuid) throw new Error("Missing Invenio credentials");

  const res = await axios.post(
    `${baseUrl}/plapi/getdata/api_villa_list_lr`,
    new URLSearchParams({ param: JSON.stringify([{ season_filter: "all" }]) }),
    { headers: { "api-key": apiKey, bp_uuid: partnerUuid }, timeout: 20000 }
  );

  return (res.data?.[0]?.result || []) as InvenioVilla[];
}

const filterFeatures = (features: string[] = []) =>
  features.filter(f => {
    const lower = f.toLowerCase();
    return !["eco tax", "hire car recommended", "security guard", "staff", "chef", "butler", "suitable for", "special features", "dj equipment", "sunloungers", "neighbours", "tv - satellite", "smart tv"].some(bad => lower.includes(bad));
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const bpUuid = Array.isArray(req.query.bpUuid) ? req.query.bpUuid[0] : req.query.bpUuid;
  if (!bpUuid) return res.status(400).send("Missing bpUuid");

  let villa: InvenioVilla;
  try {
    const villas = await fetchVillas();
    villa = villas.find(v => v.bp_uuid === bpUuid)!;
    if (!villa) return res.status(404).send("Villa not found");
  } catch (err) {
    console.error(err);
    return res.status(502).send("Failed to load villa");
  }

  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const safeName = villa.bp_name.replace(/[^a-zA-Z0-9]/g, "_");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}_brochure.pdf"`);
  doc.pipe(res);

  const gold = "#D4AF37";

  // COVER - EXACTLY LIKE YOUR SCREENSHOT
  if (villa.photos?.[0]) {
    try {
      const img = await axios.get(villa.photos[0], { responseType: "arraybuffer", timeout: 15000 });
      doc.image(Buffer.from(img.data), 0, 0, { width: 595, height: 842 });
      doc.rect(0, 0, 595, 842).fillColor("black").fillOpacity(0.5).fill();
    } catch {}
  }

  doc.fillColor("white")
     .font("Helvetica-Bold")
     .fontSize(52)
     .text(villa.bp_name.toUpperCase(), 50, 280);

  if (villa.bp_profile) {
    doc.font("Helvetica-Oblique")
       .fontSize(18)
       .fillColor("white")
       .text(`"${villa.bp_profile.trim()}"`, 50, 380, { width: 495, align: "center" });
  }

  doc.moveTo(50, 720).lineTo(545, 720).lineWidth(1).strokeColor(gold).stroke();

  // Normal pages
  doc.addPage({ margin: 50 });

  const title = (text: string) => {
    doc.font("Helvetica-Bold").fontSize(28).fillColor("black").text(text.toUpperCase());
    doc.moveTo(50, doc.y + 10).lineTo(545, doc.y + 10).lineWidth(1).strokeColor(gold).stroke();
    doc.moveDown(2);
  };

  // Overview
  title("Villa Overview");
  let overview = villa.description?.split("\n\n")[0] || "A refined Ibiza retreat offering privacy and luxury.";
  doc.font("Helvetica").fontSize(12).fillColor("#333").lineGap(8).text(overview, { width: 495, align: "justify" });

  const specs = [villa.bedrooms && `${villa.bedrooms} Bedrooms`, villa.bathrooms && `${villa.bathrooms} Bathrooms`, villa.guests && `Sleeps ${villa.guests}`, villa.built_size && `${villa.built_size} m² Built`, villa.plot_size && `${villa.plot_size} m² Plot`].filter(Boolean).join("  •  ");
  if (specs) {
    doc.moveDown(1);
    doc.fontSize(11).fillColor("#666").text(specs, { align: "center", width: 495 });
  }

  if (villa.photos?.[1]) {
    try {
      const img = await axios.get(villa.photos[1], { responseType: "arraybuffer", timeout: 15000 });
      doc.moveDown(2);
      doc.image(Buffer.from(img.data), 50, doc.y, { width: 495, height: 320 });
    } catch {}
  }

  // Features
  doc.addPage({ margin: 50 });
  title("Features & Amenities");

  const clean = filterFeatures(villa.features || []);
  const half = Math.ceil(clean.length / 2);
  const startY = doc.y;

  doc.fontSize(11).fillColor("#333").lineGap(6);
  clean.slice(0, half).forEach(f => doc.text(`• ${f}`, 50, doc.y));
  clean.slice(half).forEach((f, i) => doc.text(`• ${f}`, 300, startY + i * 18));

  // Gallery
  const gallery = (villa.photos || []).slice(2);
  let i = 0;
  while (i < gallery.length) {
    doc.addPage({ margin: 50 });
    title("Gallery");

    const page = gallery.slice(i, i + 6);
    i += 6;

    let y = doc.y + 30;
    for (const url of page) {
      if (!url) continue;
      const col = page.indexOf(url) % 2;
      const row = Math.floor(page.indexOf(url) / 2);
      if (col === 0 && row > 0) y += 180;
      const x = 50 + col * 305;

      try {
        const img = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
        doc.image(Buffer.from(img.data), x, y, { width: 240, height: 160 });
      } catch {}
    }
  }

  // Location + MAP - OpenTopoMap (100% WORKING, NO KEY NEEDED)
  doc.addPage({ margin: 50 });
  title("Location");

  const loc = [villa.areaname, villa.city, villa.destination].filter(Boolean).join(" • ");
  doc.fontSize(14).fillColor("#666").text(loc, { align: "center", width: 495 });
  doc.moveDown(2);

  doc.fontSize(12).fillColor("#333").text(
    "The villa is positioned close to Ibiza’s best beaches, restaurants and marinas, while remaining peaceful and discreet. Exact location details are available upon request.",
    { width: 495, align: "justify", lineGap: 8 }
  );

  if (villa.bp_lat && villa.bp_lng) {
    const lat = parseFloat(villa.bp_lat);
    const lng = parseFloat(villa.bp_lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      const zoom = 15;
      const x = Math.floor((lng + 180) / 360 * (1 << zoom));
      const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * (1 << zoom));
      const mapUrl = `https://a.tile.opentopomap.org/${zoom}/${x}/${y}.png`;

      try {
        const mapImg = await axios.get(mapUrl, { responseType: "arraybuffer", timeout: 15000 });
        doc.moveDown(2);
        doc.image(Buffer.from(mapImg.data), 50, doc.y, { width: 495, height: 495 });
      } catch (e) {
        console.warn("Map tile failed");
      }
    }
  }

  doc.end();
}