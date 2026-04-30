import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  /** Options forwarded to the IntersectionObserver constructor. */
  observerOptions?: IntersectionObserverInit;
}

/**
 * Attaches an IntersectionObserver to a sentinel element and calls
 * `fetchNextPage` when it comes into view.
 *
 * Usage:
 *   const sentinelRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
 *   // …
 *   <div ref={sentinelRef} className="h-1" />
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  observerOptions,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleObserver, observerOptions);
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, observerOptions]);

  return sentinelRef;
}
