import type { ModerationPoem } from '@root/core/api/moderation/types';
import type { AppErrorType } from './appError';

export function formatDate(
	date: Date | string,
	options?: Intl.DateTimeFormatOptions,
	locale: string = 'pt-BR',
): string {
	const parsedDate = typeof date === 'string' ? new Date(date) : date;

	if (Number.isNaN(parsedDate.getTime())) 
		return 'Data inválida';
	
	return parsedDate.toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		...options,
	});
}

export function formatRelativeTime(input?: string | Date) {
	if (!input) return '';

	const date = input instanceof Date ? input : new Date(input);
	if (Number.isNaN(date.getTime())) return '';

	const diffMs = Date.now() - date.getTime();
	if (diffMs < 0) return 'agora';

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const month = 30 * day;
	const year = 365 * day;

	if (diffMs < minute) return 'agora';
	if (diffMs < hour) return `${Math.floor(diffMs / minute)}m atrás`;
	if (diffMs < day) return `${Math.floor(diffMs / hour)}h atrás`;
	if (diffMs < month) return `${Math.floor(diffMs / day)}d atrás`;
	if (diffMs < year) return `${Math.floor(diffMs / month)}mo atrás`;
	return `${Math.floor(diffMs / year)}a atrás`;
}

export type Options<TBody> = {
	path: string;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	query?: QueryParams;
	params?: (string | number)[];
	body?: TBody;
	credentials?: RequestCredentials;
	signal?: AbortSignal;
	headers?: HeadersInit;
};

export function translateVisibility(visibility: ModerationPoem['visibility']) {
	switch (visibility) {
		case 'public':
			return 'Publico';
		case 'private':
			return 'Privado';
		case 'unlisted':
			return 'Nao listado';
		default:
			return visibility;
	}
}

export function translateModerationStatus(status: ModerationPoem['moderationStatus']) {
	switch (status) {
		case 'approved':
			return 'Aprovado';
		case 'rejected':
			return 'Rejeitado';
		case 'pending':
			return 'Pendente';
		case 'removed':
			return 'Removido';
		default:
			return status;
	}
}

/**
 * Sends an HTTP request to the given API endpoint and returns the parsed JSON response.
 *
 * @throws AppErrorType When the response status is not successful.
 *
 * Note: The request options allow a body for any HTTP method. Callers must ensure
 * compatibility with the target server when sending a body with GET requests.
 */

export async function createHTTPRequest<TResponse, TBody = undefined>({
	path,
	method = 'GET',
	query,
	params,
	body,
	credentials = 'include',
	signal,
	headers,
}: Options<TBody>): Promise<TResponse> {
	const baseUrl = import.meta.env.VITE_API_URL;
	if (!baseUrl) throw new Error('VITE_API_URL is not defined');

	const url = buildUrl(baseUrl, path, params, query);

	const response = await fetch(url, {
		method,
		credentials,
		signal,
		headers: {
			...(body ? { 'Content-Type': 'application/json' } : {}),
			...headers,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const contentType = response.headers.get('content-type');
	const hasJson = contentType?.includes('application/json');
	const parsedBody = hasJson ? await response.json() : null;

	if (!response.ok) {
		const error: AppErrorType = {
			statusCode: response.status,
			message: parsedBody?.message ?? [`Erro HTTP ${response.status}`],
			code: parsedBody?.code ?? 'INTERNAL_SERVER_ERROR',
		};
		throw error;
	}
	return parsedBody;
}

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[] | undefined;
type QueryParams = Record<string, QueryValue>;

function buildUrl(
	baseUrl: string,
	path: string,
	params?: (string | number)[],
	query?: QueryParams,
): string {
	let url = `${baseUrl}${path}`;

	if (params && params.length > 0) url += `/${params.join('/')}`;

	if (query) {
		const filteredEntries = Object.entries(query).flatMap(([key, value]) => {
			if (value === undefined) return [];
			if (Array.isArray(value)) {
				return value
					.filter((item) => item !== undefined)
					.map((item) => [key, String(item)] as [string, string]);
			}
			return [[key, String(value)] as [string, string]];
		});

		if (filteredEntries.length > 0) {
			const searchParams = new URLSearchParams(filteredEntries).toString();
			url += `?${searchParams}`;
		}
	}

	return url;
}
