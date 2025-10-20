// components/Lightbox.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  images: string[];
  startIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function Lightbox({ images, startIndex = 0, isOpen, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const prevOverflow = useRef<string>('');

  // Sync index when reopened from a different thumbnail
  useEffect(() => setIndex(startIndex), [startIndex, isOpen]);

  // Escape/arrow keys + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow.current;
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;
  const src = images[index] || images[0];

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-white"
      >
        ✕
      </button>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <img
          src={src}
          alt={`Photo ${index + 1}`}
          className="max-h-[86vh] max-w-[92vw] object-contain"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* Prev / Next */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md"
        onClick={() => setIndex(i => (i - 1 + images.length) % images.length)}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md"
        onClick={() => setIndex(i => (i + 1) % images.length)}
        aria-label="Next"
      >
        ›
      </button>

      {/* Inline thumbs (lazy) */}
      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 px-4">
        {images.slice(0, 14).map((s, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`relative h-14 w-20 rounded-md overflow-hidden ring-2 ${i === index ? 'ring-white' : 'ring-transparent hover:ring-white/40'}`}
            aria-label={`Go to photo ${i + 1}`}
          >
            <img src={s} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
