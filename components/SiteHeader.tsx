// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={
      "fixed top-0 z-50 w-full transition-colors " +
      (scrolled ? "bg-white/90 backdrop-blur shadow-sm" : "bg-transparent")
    }>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* Use the exact file you have: /public/m2i-logo.png */}
          <img
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            className="h-7 w-auto inline-block"
            decoding="async"
            loading="eager"
          />
          <span className={(scrolled ? "text-slate-900" : "text-white") + " font-semibold tracking-wide"}>
            Move2Ibiza
          </span>
        </Link>

        <nav className={(scrolled ? "text-slate-800" : "text-white") + " hidden sm:flex items-center gap-6 text-sm"}>
          <a href="/#grid" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">
            Explore properties
          </a>
          <a href="/#about" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">
            About us
          </a>
          <a href="/#contact" className="opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
