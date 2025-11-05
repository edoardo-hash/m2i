// components/MobileNavPopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string };

type Props = {
  /** Optional: toggles light/dark styling of the button/panel */
  isLight?: boolean;
  items: Item[];
  phone?: string;
  email?: string;
};

export default function MobileNavPopover({
  isLight = false, // <-- now accepted (optional)
  items,
  phone,
  email,
}: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        open &&
        t &&
        !btnRef.current?.contains(t) &&
        !panelRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  const buttonClasses = [
    "inline-flex h-10 w-10 items-center justify-center rounded-full shadow",
    "ring-1 ring-black/10 transition",
    isLight ? "bg-white text-gray-900 hover:bg-white/90" : "bg-white/90 text-gray-900 hover:bg-white",
  ].join(" ");

  const panelClasses = [
    "absolute right-0 mt-2 w-[88vw] max-w-sm rounded-2xl border",
    "bg-white/95 backdrop-blur-md shadow-xl ring-1 ring-black/10",
    "p-4",
  ].join(" ");

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label="Open menu"
        className={buttonClasses}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="opacity-80"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {open && (
        <div ref={panelRef} className={panelClasses} style={{ zIndex: 1000 }}>
          {/* little pointer / caret */}
          <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 rounded-sm bg-white/95 ring-1 ring-black/10" />

          <div className="space-y-3">
            {/* menu links */}
            <div className="space-y-3">
              {items.map((it) => (
                <a
                  key={it.href + it.label}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-4 text-[17px] font-medium text-gray-900 shadow-sm hover:bg-white/90"
                >
                  {it.label}
                  <span className="text-gray-400">›</span>
                </a>
              ))}
            </div>

            {/* actions */}
            {(phone || email) && (
              <div className="grid grid-cols-2 gap-3">
                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-center font-medium text-gray-900 shadow-sm hover:bg-white/90"
                    onClick={() => setOpen(false)}
                  >
                    Call
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-center font-medium text-gray-900 shadow-sm hover:bg-white/90"
                    onClick={() => setOpen(false)}
                  >
                    Email
                  </a>
                )}
              </div>
            )}

            {/* close */}
            <button
              type="button"
              className="mt-1 w-full rounded-2xl bg-[#0E1524] px-4 py-3 text-center font-medium text-white shadow"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
