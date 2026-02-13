export type ParsedJsonBody<T = Record<string, unknown>> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<ParsedJsonBody<T>> {
  try {
    const data = (await request.json()) as T;
    if (data === null || typeof data !== "object") {
      return { ok: false, error: "Request body must be a JSON object" };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
}
