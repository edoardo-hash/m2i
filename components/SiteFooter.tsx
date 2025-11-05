import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col gap-6 text-center text-sm text-slate-600">
        
        {/* Top legal navigation */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-slate-700">
          <a
            href="https://www.iubenda.com/privacy-policy/91895404"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.iubenda.com/privacy-policy/91895404/cookie-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Cookie Policy
          </a>
          <a
            href="https://inveniohomes.com/en/legal-notice/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Legal Notice
          </a>
          <Link
            href="/terms"
            className="hover:underline"
          >
            Terms & Conditions
          </Link>
        </nav>

        {/* Invenio registration details */}
        <div className="text-xs leading-relaxed text-slate-500">
          <p>INVENIO HOMES S.L.</p>
          <p>CR/0114-E · GOIBE766172/2024</p>
          <p>
            C. San Lorenzo y Molins de Rei, 12, 07840 Santa Eulària des Riu · CIF B16649519
          </p>
          <a
            href="https://tinyurl.com/2w93kfcc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-slate-400"
          >
            https://tinyurl.com/2w93kfcc
          </a>
        </div>

        {/* Copyright */}
        <p className="text-slate-400 mt-2">
          © {new Date().getFullYear()} Move2Ibiza · Invenio Homes S.L.
        </p>
      </div>
    </footer>
  );
}
