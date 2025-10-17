// pages/v/[slug].tsx
"use client";
import Head from "next/head";
import { useState } from "react";
import Lightbox from "../../components/Lightbox";
import dynamic from "next/dynamic";

const OSMMap = dynamic(() => import("../../components/OSMMap"), { ssr: false });

type Villa = {
  title?: string;
  location?: string;
  city?: string;
  destination?: string;
  images?: string[];
  gallery?: Array<{ url?: string; src?: string }>;
  coords?: { lat?: number; lng?: number };
  lat?: number; lng?: number;
};

const pickImages = (v?: Villa): string[] => {
  if (!v) return [];
  if (Array.isArray(v.images) && v.images.length) return v.images;
  if (Array.isArray(v.gallery)) {
    return v.gallery.map((g) => (g.url || g.src)).filter(Boolean) as string[];
  }
  return [];
};

export default function VillaPage({ villa }: { villa?: Villa }) {
  const v = villa || {};
  const images = pickImages(v);
  const hero = images[0] || "/es-vedra-hero.jpg";
  const title = v.title || "Villa";
  const loc = v.location || v.city || v.destination || "Ibiza";
  const lat = v.coords?.lat ?? v.lat ?? 38.984;  // Ibiza approx
  const lng = v.coords?.lng ?? v.lng ?? 1.435;

  // Lightbox state
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(0);

  return (
    <>
      <Head>
        <title>{title} – Move2Ibiza</title>
        {hero && <meta property="og:image" content={hero} />}
      </Head>

      {/* HERO */}
      <div className="relative w-full h-[90vh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt={title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-12 left-12 text-white drop-shadow">
          <h1 className="text-4xl font-semibold">{title}</h1>
          <p className="text-lg opacity-90">{loc}</p>
        </div>
      </div>

      {/* CONTENT */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tabs header left as-is in your project */}

          {/* GALLERY */}
          <section id="gallery" className="mt-8">
            <h2 className="text-2xl font-serif mb-4">Gallery</h2>
            {images.length === 0 ? (
              <p className="text-slate-500">No photos available.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setStart(i); setOpen(true); }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl focus:outline-none"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Photo ${i+1}`} className="h-full w-full object-cover group-hover:opacity-95 transition" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* LOCATION WITH OPENSTREETMAP */}
          <section id="location" className="mt-12">
            <h2 className="text-2xl font-serif mb-4">Location</h2>
            <OSMMap lat={lat} lng={lng} zoom={11} />
          </section>
        </div>
      </main>

      {/* LIGHTBOX PORTAL */}
      <Lightbox images={images} isOpen={open} startIndex={start} onClose={() => setOpen(false)} />
    </>
  );
}
