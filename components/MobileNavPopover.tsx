"use client";

import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string };

export default function MobileNavPopover({
  items,
  phone,
  email,
}: {
  items: Item[];
  phone?: string;
  email?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Close on outside click / ESC
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow ring-1 ring-black/10"
      >
        <span className="sr-only">Menu</span>
        <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true">
          <circle cx="2.5" cy="8" r="1.6" />
          <circle cx="8" cy="8" r="1.6" />
          <circle cx="13.5" cy="8" r="1.6" />
        </svg>
      </button>

      {open && (
        <div
          ref={popRef}
          role="menu"
          aria-label="Mobile navigation"
          className="absolute right-0 mt-2 w-[88vw] max-w-sm origin-top-right rounded-3xl bg-white/95 p-3 shadow-xl ring-1 ring-black/10 backdrop-blur"
          style={{ top: "calc(100% + 10px)" }} // ensure it opens BELOW the button
        >
          <div className="space-y-3">
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl border border-slate-200 px-5 py-4 text-base font-medium text-slate-900 hover:bg-slate-50"
              >
                <span className="flex items-center justify-between">
                  {it.label}
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M7 15l5-5-5-5"
                    />
                  </svg>
                </span>
              </a>
            ))}

            <div className="grid grid-cols-2 gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="rounded-2xl border border-slate-200 px-5 py-4 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Call
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="rounded-2xl border border-slate-200 px-5 py-4 text-center font-medium text-slate-900 hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
