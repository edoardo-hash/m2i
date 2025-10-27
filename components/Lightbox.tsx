// components/Lightbox.tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  images: string[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function Lightbox({
  images,
  startIndex = 0,
  isOpen,
  onClose,
}: Props) {
  const [index, setIndex] = useState(startIndex);
  const prevOverflow = useRef<string>("");

  // Sync index when reopened from a different thumbnail
  useEffect(() => setIndex(startIndex), [startIndex, isOpen]);

  // Escape/arrow keys + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow.current;
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;
  const src = images[index] || images[0];

  return (
    // Backdrop closes on click
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button (always on top) */}
      <button
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-4 right-4 z-[1010] h-10 w-10 grid place-items-center rounded-full bg-white/90 hover:bg-white shadow"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.3 5.7 12 12l-6.3-6.3-1.4 1.4L10.6 13.4 4.3 19.7l1.4 1.4L12 14.8l6.3 6.3 1.4-1.4-6.3-6.3 6.3-6.3z"
          />
        </svg>
      </button>

      {/* Content wrapper: stop backdrop close */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-[92vw] max-h-[86vh] pointer-events-auto">
          <img
            src={src}
            alt={`Photo ${index + 1}`}
            className="max-h-[86vh] max-w-[92vw] object-contain"
            decoding="async"
            fetchPriority="high"
          />

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 text-black/80 h-10 w-10 grid place-items-center rounded-full bg-white/85 hover:bg-white shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-black/80 h-10 w-10 grid place-items-center rounded-full bg-white/85 hover:bg-white shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % images.length);
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline thumbs */}
      {images.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="inline-flex gap-2 rounded-2xl bg-white/10 p-2">
            {images.slice(0, 14).map((s, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`relative h-14 w-20 overflow-hidden rounded-md ring-2 ${
                  i === index ? "ring-white" : "ring-transparent hover:ring-white/40"
                }`}
                aria-label={`Go to photo ${i + 1}`}
              >
                <img src={s} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
