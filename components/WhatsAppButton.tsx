// components/WhatsAppButton.tsx
"use client";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // We’ll compute the message at click-time to avoid stale values
    const isVillaPage = !!pathname && pathname.startsWith("/v/");
    let message: string;

    if (isVillaPage && typeof document !== "undefined" && typeof window !== "undefined") {
      // Prefer meta tag, then fall back to document.title prefix
      const meta = document.querySelector('meta[name="x-villa-name"]') as HTMLMetaElement | null;
      const titleFromMeta = meta?.content?.trim();
      const titleFromDoc = (document.title || "").split(" — ")[0].trim();
      const villaName = titleFromMeta || titleFromDoc || "this property";
      const url = window.location.href;

      message = `Hi! I'd like to know more about ${villaName}. Here is the link: ${url}`;
    } else {
      message = "Hi! I'm interested in renting a property in Ibiza.";
    }

    const whatsappURL = `https://wa.me/34671349592?text=${encodeURIComponent(message)}`;

    // navigate with fresh message
    e.preventDefault();
    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  };

  // href is a fallback; real URL is built on click
  return (
    <a
      href="https://wa.me/34671349592"
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:scale-105 transition-transform"
    >
      <FaWhatsapp size={28} />
    </a>
  );
}
