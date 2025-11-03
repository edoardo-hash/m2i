'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type ShimmerImageProps = ImageProps & {
  radius?: string; // optional rounded style (e.g., "rounded-xl")
};

export default function ShimmerImage({
  radius = 'rounded-2xl',
  ...props
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={props.src}
      alt={props.alt || ''}
      {...props}
      className={`${radius} object-cover transition-opacity duration-700 ease-in-out ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${props.className || ''}`}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNFMEUwRTAiLz48L3N2Zz4="
      onLoadingComplete={() => setLoaded(true)}
      loading="lazy"
    />
  );
}
