import type { AppErrorType } from '../utils/AppError';

export function formatDate(
	date: Date | string,
	options?: Intl.DateTimeFormatOptions,
	locale: string = 'pt-BR',
): string {
	const parsedDate = typeof date === 'string' ? new Date(date) : date;

	if (Number.isNaN(parsedDate.getTime())) {
		return 'Data inválida';
	}

	return parsedDate.toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		...options,
	});
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
	if (!baseUrl) {
		throw new Error('VITE_API_URL is not defined');
	}

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
			errorMessages: parsedBody?.errorMessages ?? [
				`Erro HTTP ${response.status}`,
			],
		};
		throw error;
	}
	return parsedBody;
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildUrl(
	baseUrl: string,
	path: string,
	params?: (string | number)[],
	query?: QueryParams,
): string {
	let url = `${baseUrl}${path}`;

	if (params && params.length > 0) {
		url += `/${params.join('/')}`;
	}

	if (query) {
		const filteredEntries = Object.entries(query)
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => [key, String(value)]);

		if (filteredEntries.length > 0) {
			const searchParams = new URLSearchParams(filteredEntries).toString();
			url += `?${searchParams}`;
		}
	}

	return url;
}
