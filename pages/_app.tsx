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

      {/* Meta Pixel */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1233510735344879');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* Main content */}
      <div className="pb-24">
        <Component {...pageProps} />
      </div>

      {/* Footer and WhatsApp */}
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
