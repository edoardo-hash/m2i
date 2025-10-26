// components/SiteHeader.tsx
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Props = {
  variant?: 'solid' | 'overlay';
};

export default function SiteHeader({ variant = 'solid' }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== 'overlay') return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  const isOverlay = variant === 'overlay' && !scrolled;

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-80 transition',
        isOverlay ? 'bg-transparent' : 'bg-white/85 backdrop-blur-md ring-1 ring-black/5'
      ].join(' ')}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className=h"flex items-center gap-2">
          <img
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            className="h-8 md:h-9 lg:h-10 xl:h-11 w-auto"
            loading="eager"
            decoding="async"
          />
          <span className={["font-medium tracking-wide transition",
            isOverlay ? 'text-white/90' : 'text-slate-800'].join(' ')}>
            Move2Ibiza
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/#search" className={isOverlay ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
            Start your search
          </Link>
          <Link href="/#featured" className={isOverlay ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
            Featured
          </Link>
          <Link href="/#contact" className={isOverlay ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
