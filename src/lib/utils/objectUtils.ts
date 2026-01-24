/**
 * Safely retrieves a nested value from an object using dot notation.
 * @param obj - The object to retrieve the value from
 * @param path - Dot-separated path to the value (e.g., "store.title")
 * @returns The value at the path, or empty string if not found
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  if (!path) return "";
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return "";
    if (typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : "";
}
