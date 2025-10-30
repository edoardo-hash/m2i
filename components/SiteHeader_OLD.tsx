// components/SiteHeader.tsx
'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Props = {
  variant?: 'solid' | 'overlay';
};

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export default function SiteHeader({ variant = 'solid' }: Props) {
  // progress 0 → transparent, 1 → solid/blurred
  const [progress, setProgress] = useState(variant === 'overlay' ? 0 : 1);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (variant !== 'overlay') return;
    const max = 180; // px of scroll for full solid; tweak to taste

    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        const p = clamp(window.scrollY / max, 0, 1);
        setProgress(p);
      });
    };

    onScroll(); // set initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [variant]);

  // Interpolated styles
  const bgAlpha = 0.85 * progress; // 0 → 0.85
  const ringAlpha = 0.06 * progress; // 0 → 0.06
  const blurPx = Math.round(12 * progress); // 0 → 12px

  const isLightText = variant === 'overlay' && progress < 0.5;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 transition-[background-color] duration-200"
      style={{
        backgroundColor:
          variant === 'overlay'
            ? `rgba(255,255,255,${bgAlpha})`
            : 'rgba(255,255,255,0.85)',
        backdropFilter:
          variant === 'overlay' ? (progress > 0 ? `saturate(180%) blur(${blurPx}px)` : 'none') : 'saturate(180%) blur(12px)',
        WebkitBackdropFilter:
          variant === 'overlay' ? (progress > 0 ? `saturate(180%) blur(${blurPx}px)` : 'none') : 'saturate(180%) blur(12px)',
        boxShadow:
          ringAlpha > 0
            ? `0 0 0 1px rgba(0,0,0,${ringAlpha})`
            : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            className="h-8 md:h-9 lg:h-10 xl:h-11 w-auto"
            loading="eager"
            decoding="async"
          />
          <span
            className={[
              'font-medium tracking-wide transition-colors duration-200',
              isLightText ? 'text-white/90' : 'text-slate-800',
            ].join(' ')}
          >
            Move2Ibiza
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {['Start your search', 'Featured', 'Contact'].map((label, i) => (
            <Link
              key={i}
              href={i === 0 ? '/#search' : i === 1 ? '/#featured' : '/#contact'}
              className={isLightText ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
