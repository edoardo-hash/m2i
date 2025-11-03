// components/ShimmerImage.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "placeholder"> & {
  radius?: string; // Tailwind classes for rounding, defaults to "rounded-t-2xl"
};

const shimmer = (w: number, h: number) => `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#e5e7eb" offset="20%" />
        <stop stop-color="#f3f4f6" offset="50%" />
        <stop stop-color="#e5e7eb" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#e5e7eb" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
  </svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);

export default function ShimmerImage({ radius = "rounded-t-2xl", ...props }: Props) {
  const [loaded, setLoaded] = useState(false);

return (
  <Image
    src={props.src}
    alt={props.alt || ""}
    {...props}
    className={`${radius} object-cover ${props.className || ""} ${
      loaded ? "opacity-100" : "opacity-0"
    }`}
    placeholder="blur"
    blurDataURL="data:image/svg+xml;base64,..."
    onLoadingComplete={() => setLoaded(true)}
    loading="lazy"
  />
);

