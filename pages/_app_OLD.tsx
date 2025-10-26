import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 rounded">
        Skip to content
      </a>
      <Component {...pageProps} />
    </>
  );
}
