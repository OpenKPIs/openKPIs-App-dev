import { NextResponse } from 'next/server';

type OkShape<T> = { ok: true; data: T };
type ErrShape = { ok: false; error: string; details?: unknown };

export function ok<T>(data: T, status = 200) {
	return NextResponse.json<OkShape<T>>({ ok: true, data }, { status });
}

export function created<T>(data: T) {
	return ok(data, 201);
}

export function error(message: string, status = 500, details?: unknown) {
	return NextResponse.json<ErrShape>({ ok: false, error: message, details }, { status });
}

export function badRequest(message = 'Bad Request', details?: unknown) {
	return error(message, 400, details);
}

export function unauthorized(message = 'Unauthorized') {
	return error(message, 401);
}

export function forbidden(message = 'Forbidden') {
	return error(message, 403);
}

export function notFound(message = 'Not Found') {
	return error(message, 404);
}

export function multiStatus(message = 'Multi-Status', details?: unknown) {
	// 207
	return error(message, 207, details);
}












