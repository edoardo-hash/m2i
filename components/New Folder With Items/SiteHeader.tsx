"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SiteHeader({ variant = "default" }: { variant?: "default" | "overlay" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        variant === "overlay"
          ? scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
          : "bg-white/95 backdrop-blur-md shadow-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4 md:px-8">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            width={120} // 15% larger
            height={40}
            className={`transition-transform duration-300 ${scrolled ? "scale-100" : "scale-110"}`}
          />
          <span
            className={`text-white font-medium tracking-wide transition-colors duration-300 ${
              scrolled ? "text-gray-800" : "text-white"
            }`}
          >
            Move2Ibiza
          </span>
        </Link>

        <nav
          className={`flex items-center space-x-6 text-sm font-medium transition-colors duration-300 ${
            scrolled ? "text-gray-800" : "text-white"
          }`}
        >
          <Link href="/#search">Start your search</Link>
          <Link href="/#featured">Featured</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
