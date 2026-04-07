"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Defers rendering of children until the wrapper scrolls near the viewport.
 * Reduces initial JS execution and DOM size for below-the-fold sections.
 */
export function LazySection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={className}>
      {visible ? children : <div style={{ minHeight: 200 }} />}
    </div>
  );
}
