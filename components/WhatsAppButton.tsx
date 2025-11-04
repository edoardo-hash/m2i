// components/WhatsAppButton.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [villaName, setVillaName] = useState<string | null>(null);

  useEffect(() => {
    if (!pathname) return; // guard for null

    // When on a villa page, grab stored villa name
    if (pathname.startsWith("/v/")) {
      const stored =
        typeof window !== "undefined"
          ? window.localStorage.getItem("m2i_villaName")
          : null;
      setVillaName(stored);
    } else {
      setVillaName(null);
    }
  }, [pathname]);

  // Build WhatsApp message
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "https://m2i-qjvb.vercel.app/";

  const message = villaName
    ? `Hi! I'd like to know more about ${villaName}. Here is the link: ${currentUrl}`
    : `Hi! I'm interested in renting a property in Ibiza.\n${currentUrl}`;

  const whatsappURL = `https://wa.me/34671349592?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
