import { useLayoutEffect, useEffect, useRef } from 'react';

type Options = {
  rootMargin?: string;
  threshold?: number;
};

export function useIntersectionObserver(onIntersect: () => void, { rootMargin = '0px', threshold = 0 }: Options = {}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Keep callback ref stable so the observer never needs to reconnect on re-renders
  const onIntersectRef = useRef(onIntersect);

  useLayoutEffect(() => {
    onIntersectRef.current = onIntersect;
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return sentinelRef;
}
