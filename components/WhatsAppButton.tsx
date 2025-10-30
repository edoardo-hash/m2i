// components/WhatsAppButton.tsx
import React from "react";

type Props = {
  phone?: string;
  message?: string;
  className?: string;
  size?: number;
};

export default function WhatsAppButton({
  phone,
  message = "Hi! I’d like to know more about availability.",
  className = "",
  size = 56,
}: Props) {
  const fallback = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+34671349592";
  const num = (phone || fallback).replace(/\D/g, "");
  const href = `https://wa.me/${num}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  const base =
    "fixed z-50 inline-flex items-center justify-center rounded-full shadow-lg ring-1 ring-black/10 " +
    "bg-[#25D366] hover:opacity-95 focus-visible:outline focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-[#C6A36C] " +
    "bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-[calc(env(safe-area-inset-right)+1.25rem)]";

  const style: React.CSSProperties = { width: size, height: size };

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp" className={`${base} ${className}`} style={style}>
      {/* crisp, scalable SVG icon */}
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} className="text-white" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 0C5.37 0 0 5.37 0 12c0 2.1.55 4.09 1.51 5.81L.09 24l6.34-1.66A12 12 0 1 0 12 0zm6.78 17.2c-.27.76-1.57 1.45-2.16 1.48-.58.03-1.31.04-2.12-.13-.49-.1-1.12-.36-1.94-.76-3.41-1.65-5.62-5.55-5.79-5.81-.17-.26-1.38-1.84-1.38-3.51s.88-2.49 1.2-2.84c.27-.29.71-.42 1.12-.42.14 0 .26.01.37.01.33.02.49.04.71.55.27.65.92 2.23 1 2.4.08.16.13.35.03.56-.1.22-.16.35-.31.54-.15.19-.33.43-.47.58-.16.16-.32.33-.14.64.18.31.8 1.32 1.72 2.14 1.19 1.06 2.19 1.4 2.51 1.56.32.16.51.14.7-.08.2-.22.8-.93 1.02-1.25.22-.32.45-.27.75-.16.3.11 1.9.9 2.22 1.06.32.16.53.25.61.39.08.14.08.81-.19 1.57z"
        />
      </svg>
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
