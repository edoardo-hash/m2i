import Link from "next/link";
import Image from "next/image";

export default function StickyHeader() {
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
      <div className="mx-auto max-w-7xl h-12 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/m2i-logo.png"
            alt="Move2Ibiza"
            width={20}
            height={20}
            className="object-contain"
            priority
          />
          <span className="text-sm font-semibold text-slate-800">Move2Ibiza</span>
        </Link>
        <nav className="ml-auto flex items-center gap-5">
          <a href="#grid" className="text-sm text-slate-700 hover:text-slate-900">Explore</a>
          <a href="#about" className="text-sm text-slate-700 hover:text-slate-900">About</a>
        </nav>
      </div>
    </div>
  );
}
