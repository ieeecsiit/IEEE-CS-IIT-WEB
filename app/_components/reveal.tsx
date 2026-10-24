"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

const hidden = {
  left: "opacity-0 -translate-x-[100px]",
  right: "opacity-0 translate-x-[100px]",
  bottom: "opacity-0 translate-y-[100px]",
  flip: "opacity-0 [transform:perspective(1000px)_rotateY(-90deg)]",
  grow: "scale-y-0",
} as const;

type RevealProps = {
  children: ReactNode;
  from: keyof typeof hidden;
  as?: ElementType;
  className?: string;
};

/** Fades and slides its content in the first time it scrolls into view. */
export function Reveal({ children, from, as: Tag = "div", className = "" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-[opacity,translate,scale,transform] duration-1000 ease-out-quart motion-reduce:transition-none ${
        visible ? "" : hidden[from]
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
