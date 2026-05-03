import { useEffect, useState } from 'react';

/**
 * Fetches a URL via the Fetch API and returns a local blob URL.
 * This bypasses the browser's restriction on following cross-origin
 * 307 redirects from <img> src attributes (which affects /manus-storage/ paths).
 */
export function useBlobUrl(src: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        // On failure fall back to the original src by setting null —
        // the caller can then use the original src as fallback.
        if (!cancelled) setBlobUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return blobUrl;
}
