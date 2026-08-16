/**
 * Helpers compartidos por las API routes de `src/app/api/v1/`.
 * Ver CONTRATOS-API.md para el formato exacto de request/response/error de cada endpoint.
 */
import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { getIdempotentResponse, saveIdempotentResponse, IDEMPOTENCY_HEADER } from './idempotency';

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Envelope de error uniforme para toda /api/v1. */
function errorBody(code: string, message: string) {
  return { error: { code, message } };
}

/**
 * Envuelve un handler de escritura con:
 *   1) idempotencia (si el cliente manda el header `Idempotency-Key`, una petición
 *      repetida con la misma clave devuelve la respuesta guardada sin re-ejecutar nada),
 *   2) validación Zod del body,
 *   3) formato de error uniforme.
 *
 * La app del conductor es offline-first (ver HANDOFF.md §7.5): reintenta la MISMA
 * tarea tras reconectar, nunca la rehace desde cero — por eso todo POST/PATCH de
 * escritura pasa por aquí.
 */
export async function withIdempotency<Body, Result>(
  request: Request,
  schema: ZodType<Body>,
  handler: (body: Body) => Promise<Result>,
): Promise<NextResponse> {
  const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER);

  if (idempotencyKey) {
    const cached = getIdempotentResponse(idempotencyKey);
    if (cached) return NextResponse.json(cached.body, { status: cached.status });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(errorBody('bad_json', 'El body no es JSON válido.'), { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      errorBody('validation_error', parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(' · ')),
      { status: 422 },
    );
  }

  try {
    const result = await handler(parsed.data);
    if (idempotencyKey) saveIdempotentResponse(idempotencyKey, 200, result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ApiError) {
      const body = errorBody(err.code, err.message);
      if (idempotencyKey) saveIdempotentResponse(idempotencyKey, err.status, body);
      return NextResponse.json(body, { status: err.status });
    }
    // Server-side log; Sentry captures this too once a DSN is configured (see src/instrumentation.ts).
    console.error(err);
    return NextResponse.json(errorBody('internal_error', 'Error inesperado del servidor.'), { status: 500 });
  }
}

export function notFound(what: string): never {
  throw new ApiError(404, 'not_found', `${what} no encontrado.`);
}
