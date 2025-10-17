import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" className="scroll-smooth">
        <Head>
          <meta name="theme-color" content="#1B3A4B" />
          <meta name="color-scheme" content="light" />
          <link rel="icon" href="/favicon.ico" />
          <link rel="preload" href="/es-vedra-hero.jpg" as="image" />
        </Head>
        <body className="antialiased bg-slate-50 text-slate-800">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
