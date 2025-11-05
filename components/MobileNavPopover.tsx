"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type Item = { label: string; href: string; onClick?: () => void };

export default function MobileNavPopover({
  items = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  phone = "+34 671 349 592",
  email = "M2Ibiza@inveniohomes.com",
  isScrolled = false,
}: {
  items?: Item[];
  phone?: string;
  email?: string;
  isScrolled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // close on escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
      <span className="text-[16px] text-slate-800 font-medium">{item.label}</span>
      <span className="text-slate-300 text-lg">›</span>
    </Link>
  );

  return (
    <>
      {/* Trigger */}
      <button
        aria-label="Menu"
        onClick={() => setOpen(true)}
        className={`h-9 w-9 grid place-items-center rounded-full ring-1 ring-slate-300 shadow-sm active:scale-[0.98] transition-all duration-300 ${
          isScrolled ? "bg-white text-slate-800" : "bg-white/20 text-white"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {/* Bottom sheet portal */}
      {mounted &&
        open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
            <div className="fixed bottom-0 inset-x-0 z-[9999] animate-slideUp">
              <div className="mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200 p-4">
                {/* drag handle */}
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
                <div className="space-y-3">
                  {items.map((item) => (
                    <ItemRow key={item.href} item={item} />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-[15px] text-slate-800 font-medium active:opacity-80"
                  >
                    Call
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-[15px] text-slate-800 font-medium active:opacity-80"
                  >
                    Email
                  </a>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 w-full rounded-xl bg-[#0B1120] py-3 text-white text-[15px] font-medium shadow-sm active:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>

            {/* slide-up animation */}
            <style jsx>{`
              @keyframes slideUp {
                from {
                  transform: translateY(100%);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
              .animate-slideUp {
                animation: slideUp 0.25s ease-out forwards;
              }
            `}</style>
          </>,
          document.body
        )}
    </>
  );
}
