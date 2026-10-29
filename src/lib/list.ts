// Immutable list edits for the admin editor. Array order is display order.

export function moveItem<T>(list: readonly T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;
  const next = [...list];
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return next;
  [next[index], next[target]] = [next[target] as T, next[index] as T];
  return next;
}

export function replaceItem<T>(list: readonly T[], index: number, item: T): T[] {
  return list.map((existing, i) => (i === index ? item : existing));
}

export function removeItem<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

/** Splits "a, b,, c " into ["a", "b", "c"]. */
export function splitList(raw: string, separator: "," | "\n"): string[] {
  return raw
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}
