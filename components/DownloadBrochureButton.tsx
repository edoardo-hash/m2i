"use client";

type Props = {
  slug: string;
  className?: string;
};

export default function DownloadBrochureButton({ slug, className = "" }: Props) {
  const parts = slug.split("-");
  const bpUuid = parts.slice(-5).join("-"); // take full UUID (5 segments)

  const href = `/api/brochure/${bpUuid}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-white text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 transition ${className}`}
    >
      Download PDF
    </a>
  );
}
