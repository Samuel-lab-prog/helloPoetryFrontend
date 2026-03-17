import type { AppErrorType } from './appError';

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[] | undefined;
type QueryParams = Record<string, QueryValue>;

export type HttpRequestOptions<TBody> = {
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
}: HttpRequestOptions<TBody>): Promise<TResponse> {
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
