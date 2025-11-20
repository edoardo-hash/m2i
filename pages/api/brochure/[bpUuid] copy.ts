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
};

async function fetchVillas(): Promise<InvenioVilla[]> {
  const apiKey = process.env.INVENIO_API_KEY;
  const partnerUuid = process.env.INVENIO_BP_UUID;
  const baseUrl = process.env.INVENIO_API_BASE || "https://api.inveniohomes.com";

  if (!apiKey || !partnerUuid) {
    throw new Error("Invenio API credentials missing");
  }

  const res = await axios.post(
    `${baseUrl}/plapi/getdata/api_villa_list_lr`,
    new URLSearchParams({
      param: JSON.stringify([{ season_filter: "all" }]),
    }),
    {
      headers: {
        "api-key": apiKey,
        bp_uuid: partnerUuid,
      },
    }
  );

  return (res.data?.[0]?.result || []) as InvenioVilla[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const q = req.query.bpUuid;
  const bpUuid = Array.isArray(q) ? q[0] : q;

  if (!bpUuid) {
    return res.status(400).send("Missing bpUuid");
  }

  try {
    const villas = await fetchVillas();
    const villa = villas.find((v) => v.bp_uuid === bpUuid);

    if (!villa) {
      return res.status(404).send("Villa not found");
    }

    const tagline =
      villa.bp_profile && villa.bp_profile.trim().length > 0
        ? villa.bp_profile.trim()
        : "";

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
    });

    res.setHeader("Content-Type", "application/pdf");
    const safeName = villa.bp_name.replace(/\s+/g, "_");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}_brochure.pdf"`
    );

    doc.pipe(res);

    const primaryText = "#111111";
    const secondaryText = "#555555";
    const bodyText = "#333333";
    const lineColor = "#DDDDDD";

    const rule = () => {
      doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .lineWidth(0.5)
        .strokeColor(lineColor)
        .stroke()
        .moveDown(1);
    };

    // ---------- PAGE 1: COVER ----------
    doc.font("Helvetica-Bold").fontSize(26).fillColor(primaryText);
    doc.text(villa.bp_name, { align: "left" });

    doc.moveDown(0.4);

    if (tagline) {
      // centered italic tagline with gold underline
      doc.font("Helvetica-Oblique").fontSize(12).fillColor("#1f2937");
      doc.text(`“${tagline}”`, { align: "center" });

      doc.moveDown(0.3);
      const left = doc.page.margins.left;
      const right = doc.page.width - doc.page.margins.right;
      doc
        .moveTo(left, doc.y)
        .lineTo(right, doc.y)
        .lineWidth(1)
        .strokeColor("#C6A36C")
        .stroke();

      doc.moveDown(0.8);
    } else {
      doc
        .font("Helvetica")
        .fontSize(12)
        .fillColor(secondaryText)
        .text("A contemporary Mediterranean villa", { align: "left" });
      doc.moveDown(0.8);
    }

    if (villa.photos && villa.photos.length > 0) {
      try {
        const heroRes = await axios.get<ArrayBuffer>(villa.photos[0], {
          responseType: "arraybuffer",
        });
        const heroBuf = Buffer.from(heroRes.data);
        doc.image(heroBuf, {
          fit: [
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
            220,
          ],
          align: "center",
          valign: "center",
        });
      } catch {
        // ignore failed hero image
      }
    }

    // ---------- PAGE 2: OVERVIEW ----------
    doc.addPage();
    rule();

    doc.font("Helvetica-Bold").fontSize(16).fillColor(primaryText);
    doc.text("Villa Overview");
    doc.moveDown(0.5);

    let overviewText =
      "This refined Ibiza retreat is designed for guests who value privacy, natural light and clean architectural lines. Generous interiors open onto terraces and a pool deck, creating seamless indoor–outdoor living.";

    if (villa.description) {
      const firstParagraph = villa.description.split(/\r?\n\r?\n/)[0];
      overviewText = firstParagraph.replace(/\r\n/g, " ");
    }

    doc.font("Helvetica").fontSize(10.5).fillColor(bodyText);
    doc.text(overviewText, { align: "left" });
    doc.moveDown(0.7);

    const metaParts: string[] = [];
    if (villa.bedrooms) metaParts.push(`${villa.bedrooms} Bedrooms`);
    if (villa.bathrooms) metaParts.push(`${villa.bathrooms} Bathrooms`);
    if (villa.guests) metaParts.push(`Up to ${villa.guests} Guests`);
    if (villa.built_size) metaParts.push(`${villa.built_size} m² Built`);
    if (villa.plot_size) metaParts.push(`${villa.plot_size} m² Plot`);

    if (metaParts.length) {
      doc.font("Helvetica").fontSize(9).fillColor(secondaryText);
      doc.text(metaParts.join("   •   "));
      doc.moveDown(0.6);
    }

    if (villa.photos && villa.photos.length > 1) {
      try {
        const imgRes = await axios.get<ArrayBuffer>(villa.photos[1], {
          responseType: "arraybuffer",
        });
        const imgBuf = Buffer.from(imgRes.data);
        doc.image(imgBuf, {
          fit: [
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
            220,
          ],
          align: "center",
          valign: "center",
        });
      } catch {
        // ignore
      }
    }

    // ---------- PAGE 3: FEATURES & LAYOUT ----------
    doc.addPage();
    rule();

    doc.font("Helvetica-Bold").fontSize(16).fillColor(primaryText);
    doc.text("Features & Layout");
    doc.moveDown(0.5);

    doc.font("Helvetica").fontSize(10.5).fillColor(bodyText);

    if (villa.features && villa.features.length) {
      villa.features.forEach((f) => doc.text(`• ${f}`));
    } else {
      doc.text(
        "Open-plan living and dining, fully equipped contemporary kitchen, en-suite bedrooms, climate control, landscaped gardens, private pool and sun terrace."
      );
    }

    doc.moveDown(0.8);

    if (villa.photos && villa.photos.length > 2) {
      try {
        const imgRes = await axios.get<ArrayBuffer>(villa.photos[2], {
          responseType: "arraybuffer",
        });
        const imgBuf = Buffer.from(imgRes.data);
        doc.image(imgBuf, {
          fit: [
            doc.page.width - doc.page.margins.left - doc.page.margins.right,
            220,
          ],
          align: "center",
          valign: "center",
        });
      } catch {
        // ignore
      }
    }

    // ---------- PAGE 4: GALLERY ----------
    doc.addPage();
    rule();

    doc.font("Helvetica-Bold").fontSize(16).fillColor(primaryText);
    doc.text("Gallery");
    doc.moveDown(0.5);

    if (villa.photos && villa.photos.length > 0) {
      const galleryPhotos = villa.photos.slice(0, 6); // max 6
      const pageWidth =
        doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const colWidth = (pageWidth - 12) / 2;
      const rowHeight = 140;
      const startX = doc.page.margins.left;
      let y = doc.y;

      for (let i = 0; i < galleryPhotos.length; i++) {
        const col = i % 2;
        if (i > 0 && col === 0) {
          y += rowHeight + 10;
        }
        const x = startX + col * (colWidth + 12);

        try {
          const imgRes = await axios.get<ArrayBuffer>(galleryPhotos[i], {
            responseType: "arraybuffer",
          });
          const imgBuf = Buffer.from(imgRes.data);
          doc.image(imgBuf, x, y, {
            fit: [colWidth, rowHeight],
            align: "center",
            valign: "center",
          });
        } catch {
          // ignore individual failures
        }
      }
    }

    // ---------- PAGE 5: LOCATION (UNBRANDED) ----------
    doc.addPage();
    rule();

    doc.font("Helvetica-Bold").fontSize(16).fillColor(primaryText);
    doc.text("Location");
    doc.moveDown(0.5);

    const locParts: string[] = [];
    if (villa.city) locParts.push(String(villa.city));
    if (villa.areaname) locParts.push(String(villa.areaname));
    if (villa.destination) locParts.push(String(villa.destination));

    const locationLine = locParts.join(" • ");

    if (locationLine) {
      doc.font("Helvetica").fontSize(10.5).fillColor(bodyText);
      doc.text(locationLine);
      doc.moveDown(0.5);
    }

    doc.font("Helvetica").fontSize(10.5).fillColor(bodyText);
    doc.text(
      "The villa is positioned close to Ibiza’s beaches, restaurants and marinas, while remaining peaceful and discreet. Exact location details are available upon request.",
      { align: "left" }
    );

    // no contact info / branding here
    doc.end();
  } catch (err) {
    console.error(err);
    return res.status(500).send("Failed to generate brochure");
  }
}
