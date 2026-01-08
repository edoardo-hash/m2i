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
  gps?: string;
  bp_lat?: string;
  bp_lng?: string;
};

async function fetchVillas(): Promise<InvenioVilla[]> {
  const apiKey = process.env.INVENIO_API_KEY;
  const partnerUuid = process.env.INVENIO_BP_UUID;
  const baseUrl =
    process.env.INVENIO_API_BASE || "https://api.inveniohomes.com";

  if (!apiKey || !partnerUuid) throw new Error("Missing Invenio credentials");

  const res = await axios.post(
    `${baseUrl}/plapi/getdata/api_villa_list_lr`,
    new URLSearchParams({ param: JSON.stringify([{ season_filter: "all" }]) }),
    {
      headers: { "api-key": apiKey, bp_uuid: partnerUuid },
      timeout: 20000,
    }
  );

  return (res.data?.[0]?.result || []) as InvenioVilla[];
}

const filterFeatures = (features: string[] = []) =>
  features.filter((f) => {
    const lower = f.toLowerCase();
    return ![
      "eco tax",
      "hire car recommended",
      "security guard",
      "staff",
      "chef",
      "butler",
      "suitable for",
      "special features",
      "dj equipment",
      "sunloungers",
      "neighbours",
      "tv - satellite",
      "smart tv",
    ].some((bad) => lower.includes(bad));
  });

const cleanText = (str: string | undefined | null) =>
  (str || "")
    .replace(/Ð/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const bpUuid = Array.isArray(req.query.bpUuid)
    ? req.query.bpUuid[0]
    : req.query.bpUuid;
  if (!bpUuid) return res.status(400).send("Missing bpUuid");

  let villa: InvenioVilla;
  try {
    const villas = await fetchVillas();
    villa = villas.find((v) => v.bp_uuid === bpUuid)!;
    if (!villa) return res.status(404).send("Villa not found");
  } catch (err) {
    console.error(err);
    return res.status(502).send("Failed to load villa");
  }

  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const safeName = villa.bp_name.replace(/[^a-zA-Z0-9]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName}_brochure.pdf"`
  );

  doc.pipe(res);

  const gold = "#D4AF37";

  /* =========================================================
   * COVER PAGE
   * ======================================================= */

  if (villa.photos?.[0]) {
    try {
      const img = await axios.get(villa.photos[0], {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      doc.image(Buffer.from(img.data), 0, 0, { width: 595, height: 842 });
      doc
        .rect(0, 0, 595, 842)
        .fillColor("black")
        .fillOpacity(0.5)
        .fill();
      doc.fillOpacity(1); // reset
    } catch {
      // ignore hero load failure
    }
  }

  // TITLE – centered
  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(52)
    .text(villa.bp_name.toUpperCase(), 0, 230, {
      width: 595,
      align: "center",
    });

  // GOLD DIVIDER under title
  doc
    .moveTo(160, 300)
    .lineTo(435, 300)
    .lineWidth(2)
    .strokeColor(gold)
    .stroke();

  // BEDROOMS / BATHROOMS – centered
  const coverSpecsParts: string[] = [];
  if (villa.bedrooms) coverSpecsParts.push(`${villa.bedrooms} Bedrooms`);
  if (villa.bathrooms) coverSpecsParts.push(`${villa.bathrooms} Bathrooms`);
  const coverSpecs = coverSpecsParts.join("   •   ");

  if (coverSpecs) {
    doc
      .font("Helvetica")
      .fontSize(20)
      .fillColor("white")
      .text(coverSpecs, 0, 320, {
        width: 595,
        align: "center",
      });
  }

  // TAGLINE – centered
  const tagline = cleanText(villa.bp_profile);
  if (tagline) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(20)
      .fillColor("white")
      .text(`"${tagline}"`, 70, 380, {
        width: 455,
        align: "center",
      });
  }

  // bottom gold line
  doc
    .moveTo(50, 720)
    .lineTo(545, 720)
    .lineWidth(1)
    .strokeColor(gold)
    .stroke();

  /* =========================================================
   * NORMAL PAGES
   * ======================================================= */

  doc.addPage({ margin: 50 });

  const title = (text: string) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("black")
      .text(text.toUpperCase());
    doc
      .moveTo(50, doc.y + 10)
      .lineTo(545, doc.y + 10)
      .lineWidth(1)
      .strokeColor(gold)
      .stroke();
    doc.moveDown(2);
  };

  // Overview
  title("Villa Overview");

  let overview =
    villa.description ||
    "A refined Ibiza retreat offering privacy and luxury.";
  overview = cleanText(overview);

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#333")
    .lineGap(8)
    .text(overview, { width: 495, align: "justify" });

  const specs = [
    villa.bedrooms && `${villa.bedrooms} Bedrooms`,
    villa.bathrooms && `${villa.bathrooms} Bathrooms`,
    villa.built_size && `${villa.built_size} m² Built`,
    villa.plot_size && `${villa.plot_size} m² Plot`,
  ]
    .filter(Boolean)
    .join("  •  ");

  if (specs) {
    doc.moveDown(1);
    doc
      .fontSize(11)
      .fillColor("#666")
      .text(specs, { align: "center", width: 495 });
  }

  if (villa.photos?.[1]) {
    try {
      const img = await axios.get(villa.photos[1], {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      doc.moveDown(2);
      doc.image(Buffer.from(img.data), 50, doc.y, {
        width: 495,
        height: 320,
      });
    } catch {
      // ignore
    }
  }

  // Features
  doc.addPage({ margin: 50 });
  title("Features & Amenities");

  const cleanFeatures = filterFeatures(
    (villa.features || []).map((f) => cleanText(f))
  );
  const half = Math.ceil(cleanFeatures.length / 2);
  const startY = doc.y;

  doc.fontSize(11).fillColor("#333").lineGap(6);
  cleanFeatures.slice(0, half).forEach((f) => doc.text(`• ${f}`, 50, doc.y));
  cleanFeatures.slice(half).forEach((f, i) =>
    doc.text(`• ${f}`, 300, startY + i * 18)
  );

  // Gallery
  const gallery = (villa.photos || []).slice(2);
  let i = 0;
  while (i < gallery.length) {
    doc.addPage({ margin: 50 });
    title("Gallery");

    const page = gallery.slice(i, i + 6);
    i += 6;

    let y = doc.y + 30;
    for (let idx = 0; idx < page.length; idx++) {
      const url = page[idx];
      if (!url) continue;

      const col = idx % 2;
      const row = Math.floor(idx / 2);
      if (col === 0 && row > 0) y += 180;
      const x = 50 + col * 305;

      try {
        const img = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        doc.image(Buffer.from(img.data), x, y, {
          width: 240,
          height: 160,
        });
      } catch {
        // ignore
      }
    }
  }

  /* =========================================================
   * MAP PAGE (Mapbox) – improved
   * ======================================================= */

  let lat: number | null = null;
  let lon: number | null = null;

  if (villa.gps && typeof villa.gps === "string" && villa.gps.includes(",")) {
    const [latStr, lonStr] = villa.gps.split(",").map((s) => s.trim());
    const latNum = Number(latStr);
    const lonNum = Number(lonStr);
    if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
      lat = latNum;
      lon = lonNum;
    }
  }

  if ((!lat || !lon) && villa.bp_lat && villa.bp_lng) {
    const latNum = Number(villa.bp_lat);
    const lonNum = Number(villa.bp_lng);
    if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
      lat = latNum;
      lon = lonNum;
    }
  }

  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (lat && lon && token) {
    const zoom = 11; // zoomed-out overview
    const mapUrl =
      `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
      `pin-l+f5a623(${lon},${lat})/` +
      `${lon},${lat},${zoom},0/1200x900?access_token=${token}`;

    // Build a location line: Destination · City · Area
    const locParts = [
      villa.destination,
      villa.city,
      villa.areaname,
    ].filter(Boolean) as string[];

    doc.addPage({ margin: 50 });
    title("Map & Location");

    if (locParts.length) {
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#111")
        .text(locParts.join("   •   "), { width: 495, align: "left" });
      doc.moveDown(0.4);
    }

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#555")
      .text(
        "Approximate villa location.",
        { width: 495, align: "left" }
      );

    try {
      const mapRes = await axios.get(mapUrl, {
        responseType: "arraybuffer",
        timeout: 20000,
      });
      const mapBuffer = Buffer.from(mapRes.data);

      doc.moveDown(1.2);
      const mapY = doc.y;

      // light card/frame behind map
      doc
        .roundedRect(45, mapY - 8, 505, 390, 10)
        .lineWidth(0.5)
        .strokeColor("#E5E7EB")
        .stroke();

      doc.image(mapBuffer, 50, mapY, {
        width: 495,
        height: 370,
        align: "center",
        valign: "center",
      });
    } catch (err) {
      console.error("Mapbox load error", err);
      doc.moveDown(1.5);
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor("#555")
        .text("Map preview could not be loaded.", { align: "left" });
    }
  }

  /* ========================================================= */

  doc.end();
}
