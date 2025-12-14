const UPLOAD_BASE_URL = (import.meta.env.VITE_UPLOAD_BASE_URL ?? '').replace(/\/$/, '');

export function resolveImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) {
    return UPLOAD_BASE_URL ? `${UPLOAD_BASE_URL}${url}` : url;
  }
  return url;
}
