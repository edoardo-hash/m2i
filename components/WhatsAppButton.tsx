// components/WhatsAppButton.tsx
import React from "react";

const WA_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+34671349592"; // set your number here or in Vercel env

export default function WhatsAppButton() {
  const href = `https://wa.me/${WA_NUMBER.replace(/\D/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-50 bottom-5 right-5 md:bottom-6 md:right-6 inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg ring-1 ring-black/10 bg-[#25D366] hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A36C]"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 md:h-7 md:w-7 text-white" aria-hidden="true">
        <path fill="currentColor" d="M19.1 17.5c-.2-.1-1.2-.6-1.3-.7s-.3-.1-.5.1c-.1.2-.6.7-.8.8-.1.1-.3.1-.5 0-1-.4-1.9-1.1-2.6-2-.2-.3-.3-.5 0-.8.1-.1.2-.3.3-.4.1-.1.1-.3.2-.4 0-.2 0-.3 0-.4 0-.1-.5-1.3-.7-1.7-.2-.4-.4-.3-.5-.3h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.1.9 2.2c.1.2 1.7 2.7 4.1 3.8.6.3 1.1.5 1.5.6.6.2 1.2.2 1.7.1.5-.1 1.2-.5 1.4-1 .2-.5.2-1 .2-1.1 0-.1-.1-.1-.3-.2zM16 3C9.9 3 5 7.9 5 14c0 2.3.7 4.4 2 6.2L5 29l8.1-2.1c1.7 1 3.6 1.5 5.9 1.5 6.1 0 11-4.9 11-11S22.1 3 16 3zm0 20.7c-1.9 0-3.7-.6-5.2-1.6l-.4-.2-4.8 1.2 1.3-4.6-.3-.4C5.7 16.1 5 15.1 5 14c0-6 4.9-10.9 11-10.9S26.9 8 26.9 14 22 23.7 16 23.7z"/>
      </svg>
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
