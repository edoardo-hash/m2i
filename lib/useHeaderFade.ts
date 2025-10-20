'use client';
import { useEffect, useState } from 'react';

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export function useHeaderFade(maxPx: number = 160) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => setProgress(clamp(window.scrollY / maxPx, 0, 1));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [maxPx]);

  const bgAlpha = 0.85 * progress;
  const blurPx  = Math.round(12 * progress);

  const style: React.CSSProperties = {
    backgroundColor: `rgba(255,255,255,${bgAlpha})`,
    backdropFilter: progress > 0 ? `saturate(180%) blur(${blurPx}px)` : 'none',
    WebkitBackdropFilter: progress > 0 ? `saturate(180%) blur(${blurPx}px)` : 'none',
    boxShadow: progress > 0 ? '0 0 0 1px rgba(0,0,0,0.06)' : 'none',
  };

  const light = progress < 0.5;
  return { progress, style, light };
}
