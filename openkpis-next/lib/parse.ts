export function toArray<T>(value: T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value as T];
}

export function normalizeTags(value: string[] | string | null | undefined): string[] {
  const arr = toArray<string>(value);
  return arr
    .map((t) => (t || '').toString().trim())
    .filter(Boolean);
}

export function normalizeString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const v = String(value).trim();
  return v.length ? v : null;
}














