import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiOk<T>>({ ok: true, data }, init);
}

export function err(message: string, status = 400, details?: unknown) {
  return NextResponse.json<ApiErr>({ ok: false, error: message, details }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return err("Validation failed", 422, error.flatten());
  }
  if (error instanceof Error) {
    console.error("[api]", error);
    return err(error.message, 500);
  }
  console.error("[api] Unknown error", error);
  return err("Internal server error", 500);
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(60, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  return { page, limit, skip: (page - 1) * limit };
}
