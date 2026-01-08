// pages/_app.tsx
import type { AppProps } from "next/app";
import Script from "next/script";

import "../styles/globals.css";
import WhatsAppButton from "../components/WhatsAppButton";
import SiteFooter from "../components/SiteFooter";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-8T58EZY8F6"
        strategy="afterInteractive"
      />
      <Script
        id="ga4"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8T58EZY8F6', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* Main content */}
      <div className="pb-24">
        {/* padding so WhatsApp button doesn’t overlap footer */}
        <Component {...pageProps} />
      </div>

      {/* Footer and WhatsApp */}
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
