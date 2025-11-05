"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Item = { label: string; href: string; onClick?: () => void };

export default function MobileNavSheet({
  items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  phone = "+34 671 349 592",
  email = "M2Ibiza@inveniohomes.com",
  className = "",
  isScrolled = false,
}: {
  items?: Item[];
  phone?: string;
  email?: string;
  className?: string;
  isScrolled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    const { documentElement } = document;
    if (open) documentElement.classList.add("overflow-hidden");
    else documentElement.classList.remove("overflow-hidden");
    return () => documentElement.classList.remove("overflow-hidden");
  }, [open]);

  const ItemRow = ({ item }: { item: Item }) => (
    <Link
      href={item.href}
      onClick={() => {
        setOpen(false);
        item.onClick?.();
      }}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 active:opacity-80"
    >
      <span className="text-[15px] text-slate-800">{item.label}</span>
      <span className="text-slate-300">›</span>
    </Link>
  );

  return (
    <div className={className}>
      {/* Trigger */}
      <button
        aria-label="Open menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`h-9 w-9 grid place-items-center rounded-full ring-1 ring-slate-300 shadow-sm active:scale-[0.98] transition-all duration-300 ${
          isScrolled ? "bg-white text-slate-800" : "bg-white/20 text-white"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {/* Backdrop + Sheet */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-[2px]"
          onClick={(e) => {
            // Only close when the backdrop itself is clicked
            if (e.currentTarget === e.target) setOpen(false);
          }}
        >
          <div
            ref={sheetRef}
            className="fixed inset-x-0 bottom-0 z-[1001] rounded-t-2xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.15)] ring-1 ring-slate-200
                       translate-y-0 animate-[m2i-slideup_180ms_ease-out]
                       pb-[max(16px,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()} // clicks inside don’t bubble to backdrop
          >
            <div className="mx-auto w-full max-w-md p-4">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />

              <div className="space-y-2">
                {items.map((item) => (
                  <ItemRow key={item.href} item={item} />
                ))}
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-[15px] text-slate-800 active:opacity-80"
                >
                  Call
                </a>
                <a
                  href={`mailto:${email}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-[15px] text-slate-800 active:opacity-80"
                >
                  Email
                </a>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-white active:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes m2i-slideup {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0%);
          }
        }
      `}</style>
    </div>
  );
}
