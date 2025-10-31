"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "backdrop-blur-md bg-white/85 shadow-sm ring-1 ring-black/5"
          : "bg-transparent")
      }
    >
      <div className="mx-auto max-w-7xl h-14 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            width={22}
            height={22}
            priority
            className={!scrolled ? "drop-shadow" : ""}
          />
          <span
            className={
              "text-sm font-semibold transition-colors " +
              (scrolled ? "text-slate-800" : "text-white")
            }
          >
            Move2Ibiza
          </span>
        </Link>

        {/* optional nav; comment out if you want *only* the logo */}
        <nav className="ml-auto hidden sm:flex items-center gap-5">
          <a
            href="#grid"
            className={
              "text-sm transition-colors " +
              (scrolled ? "text-slate-700 hover:text-slate-900" : "text-white/90 hover:text-white")
            }
          >
            Explore
          </a>
          <a
            href="#about"
            className={
              "text-sm transition-colors " +
              (scrolled ? "text-slate-700 hover:text-slate-900" : "text-white/90 hover:text-white")
            }
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
}
