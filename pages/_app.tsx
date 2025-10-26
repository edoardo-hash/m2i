// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // relative import (no path alias)
import WhatsAppButton from "../components/WhatsAppButton"; // relative import

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <WhatsAppButton />
    </>
  );
}
