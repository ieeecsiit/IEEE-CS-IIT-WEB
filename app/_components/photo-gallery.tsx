"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Photo } from "@/app/_data/types";

const SLOTS = 6;
const INTERVAL_MS = 3000;
// Tiles swap in this order rather than left to right, so changes look scattered.
const SLOT_ORDER = [0, 3, 5, 1, 4, 2];

/** One fixed-size tile. A new photo fades in over the old one once it has loaded. */
function Tile({ photo, priority }: { photo: Photo; priority: boolean }) {
  const [layers, setLayers] = useState([photo]);
  const [loadedSrc, setLoadedSrc] = useState<string>();

  const top = layers[layers.length - 1];
  if (top.src !== photo.src) setLayers([top, photo]);

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-line">
      {layers.map((layer, index) => {
        const isTop = index === layers.length - 1;
        const hidden = isTop && layers.length > 1 && loadedSrc !== layer.src;
        return (
          <Image
            key={layer.src}
            src={layer.src}
            alt={layer.alt}
            fill
            priority={priority}
            sizes="(max-width: 767px) 50vw, 25vw"
            onLoad={() => isTop && setLoadedSrc(layer.src)}
            // Once the new photo is fully shown, the one underneath can go.
            onTransitionEnd={() => isTop && setLayers([layer])}
            className={`object-cover transition-opacity duration-1000 ${hidden ? "opacity-0" : "opacity-100"}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Shows a fixed grid of photos and rotates through the rest of the gallery.
 * Each tick replaces the photo that has been on screen longest, so every photo gets shown
 * and none appears twice at once.
 */
export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const total = photos.length;
  const slotCount = Math.min(SLOTS, total);
  const [{ shown }, setRotation] = useState(() => ({
    shown: Array.from({ length: slotCount }, (_, index) => index),
    tick: 0,
  }));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (total <= slotCount || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const order = SLOT_ORDER.filter((slot) => slot < slotCount);
    const timer = setInterval(() => {
      setRotation(({ shown, tick }) => {
        const slot = order[tick % order.length];
        const next = (slotCount + tick) % total;
        return { shown: shown.map((photo, index) => (index === slot ? next : photo)), tick: tick + 1 };
      });
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [total, slotCount, paused]);

  return (
    <div
      className="grid grid-cols-2 gap-2.5 self-start"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {shown.map((photoIndex, slot) => (
        <Tile key={slot} photo={photos[photoIndex % total]} priority={slot < 2} />
      ))}
    </div>
  );
}
