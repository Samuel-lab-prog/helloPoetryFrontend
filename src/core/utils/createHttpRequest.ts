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
 * Creates and sends an HTTP request to the API and returns the parsed JSON payload.
 *
 * This helper:
 * - Prefixes `path` with `import.meta.env.VITE_API_URL`.
 * - Appends `params` as additional path segments.
 * - Serializes `query` into the URL, skipping `undefined` values.
 * - Sends JSON when `body` is provided and sets `Content-Type: application/json`.
 * - Parses JSON responses and throws a typed `AppErrorType` for non-2xx statuses.
 *
 * @example
 * const profile = await createHTTPRequest<User>({
 *   path: '/users',
 *   params: [userId],
 *   query: { include: 'settings', tags: ['a', 'b'] },
 * });
 *
 * @example
 * await createHTTPRequest<void, UpdatePayload>({
 *   path: '/users',
 *   params: [userId],
 *   method: 'PATCH',
 *   body: { name: 'Ana' },
 *   signal: abortController.signal,
 * });
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
	const csrfToken = getCookieValue('csrf_token');
	const isUnsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

	const response = await fetch(url, {
		method,
		credentials,
		signal,
		headers: {
			...(body ? { 'Content-Type': 'application/json' } : {}),
			...(isUnsafeMethod && csrfToken ? { 'x-csrf-token': csrfToken } : {}),
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
			message: parsedBody?.message ?? `HTTP error ${response.status}`,
			code: parsedBody?.code ?? 'INTERNAL_SERVER_ERROR',
		};
		throw error;
	}
	return parsedBody;
}

/**
 * Reads a cookie value by name from `document.cookie`.
 */
function getCookieValue(name: string): string | null {
	if (typeof document === 'undefined') return null;
	const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
	const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));
	if (!target) return null;
	return decodeURIComponent(target.split('=').slice(1).join('='));
}

/**
 * Builds a URL with optional path params and query string.
 */
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
