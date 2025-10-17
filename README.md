# Patch: Lightbox + OpenStreetMap

## Install dependencies (for the map)
npm i react-leaflet leaflet

## Use the Lightbox in your gallery
```tsx
import { useState } from 'react';
import Lightbox from '@/components/Lightbox';

const [isOpen, setOpen] = useState(false);
const [start, setStart] = useState(0);

{/* In your grid loop: */}
<button onClick={() => { setStart(i); setOpen(true); }} className="block focus:outline-none">
  <img src={img} className="w-full h-full object-cover rounded-xl" />
</button>

<Lightbox images={imagesArray} isOpen={isOpen} startIndex={start} onClose={() => setOpen(false)} />
```

## Use OpenStreetMap
```tsx
import dynamic from 'next/dynamic';
const OSMMap = dynamic(() => import('@/components/OSMMap'), { ssr: false });

<OSMMap lat={38.984} lng={1.435} zoom={11} />
```
# m2i-V2
