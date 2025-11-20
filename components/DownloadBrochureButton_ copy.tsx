import React from "react";

type Props = {
  slug: string;
  className?: string;
};

export default function DownloadBrochureButton({ slug, className }: Props) {
  const href = `/api/invenio/brochure?slug=${encodeURIComponent(slug)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "inline-flex items-center justify-center rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 active:bg-neutral-100"
      }
    >
      Download PDF 
    </a>
  );
}
