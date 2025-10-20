'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

type LightboxProps = { images: string[]; startIndex?: number; isOpen: boolean; onClose: () => void; };

export default function Lightbox({ images, startIndex = 0, isOpen, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex);
  useEffect(() => setIndex(startIndex), [startIndex, isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, images.length, onClose]);
  if (!isOpen) return null;
  const src = images[index] || images[0];
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm">
      <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-white">✕</button>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="relative w-full max-w-6xl aspect-[16/9]">
          <Image src={src} alt="Photo" fill className="object-contain" sizes="100vw" />
        </div>
      </div>
    </div>
  );
}
