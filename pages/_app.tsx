// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";
import WhatsAppButton from "../components/WhatsAppButton";
import SiteFooter from "../components/SiteFooter";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Main content */}
      <div className="pb-24"> {/* padding so WhatsApp button doesn’t overlap footer */}
        <Component {...pageProps} />
      </div>

      {/* Footer and WhatsApp */}
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
