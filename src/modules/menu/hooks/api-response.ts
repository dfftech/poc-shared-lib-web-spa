export function isApiRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function readApiRows(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (!isApiRecord(response)) return [];
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (isApiRecord(data) && Array.isArray(data.data)) return data.data;
  return [];
}

export function hasApiRows(response: unknown): boolean {
  if (Array.isArray(response)) return true;
  if (!isApiRecord(response)) return false;
  return (
    Array.isArray(response.data) ||
    (isApiRecord(response.data) && Array.isArray(response.data.data))
  );
}

export function hasApiError(response: unknown): boolean {
  return isApiRecord(response) && Boolean(response.error);
}
