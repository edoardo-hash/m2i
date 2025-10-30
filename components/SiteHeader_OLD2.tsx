// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm transition">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            className="h-8 w-auto object-contain"
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link
            href="/#grid"
            className={cn(
              "opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]",
              pathname === "/#grid" && "text-[#C6A36C]"
            )}
          >
            Explore properties
          </Link>
          <Link
            href="/#about"
            className={cn(
              "opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]",
              pathname === "/#about" && "text-[#C6A36C]"
            )}
          >
            About us
          </Link>
          <Link
            href="/#contact"
            className={cn(
              "opacity-90 hover:opacity-100 hover:underline underline-offset-4 decoration-[#C6A36C]",
              pathname === "/#contact" && "text-[#C6A36C]"
            )}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
