"use client";

import { useEffect, useState } from "react";

export default function SiteHeaderHero() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl h-16 px-4 sm:px-6 flex items-center justify-end">
        {/* Navigation Menu */}
        <nav
          className={`hidden sm:flex items-center gap-6 text-sm font-medium ${
            isScrolled ? "text-gray-900" : "text-white"
          }`}
        >
          <a
            href="/#search"
            className="hover:underline underline-offset-4 decoration-[#C6A36C]"
          >
            Home
          </a>
          <a
            href="/#about"
            className="hover:underline underline-offset-4 decoration-[#C6A36C]"
          >
            About
          </a>
          <a
            href="/#contact"
            className="hover:underline underline-offset-4 decoration-[#C6A36C]"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
