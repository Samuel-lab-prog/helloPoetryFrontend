/* eslint-disable require-await */

import { createHTTPRequest } from './createHttpRequest';

const realFetch = globalThis.fetch;
const realDocument = globalThis.document;
const realBaseUrl = import.meta.env.VITE_API_URL;

type MockJsonResponse = {
	status: number;
	body: unknown;
	contentType?: string;
};

function mockFetchJsonResponse({
	status,
	body,
	contentType = 'application/json',
}: MockJsonResponse) {
	const response = new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': contentType,
		},
	});

	globalThis.fetch = vi.fn(async () => response) as typeof fetch;
}
describe('UTIL', () => {
	describe('createHTTPRequest', () => {
		beforeEach(() => {
			import.meta.env.VITE_API_URL = realBaseUrl;
		});

		afterEach(() => {
			globalThis.fetch = realFetch;
			globalThis.document = realDocument;
			import.meta.env.VITE_API_URL = realBaseUrl;
			vi.restoreAllMocks();
		});

		it('throws when VITE_API_URL is missing', async () => {
			import.meta.env.VITE_API_URL = '';

			await expect(createHTTPRequest({ path: '/users' })).rejects.toThrow(
				'VITE_API_URL is not defined',
			);
		});

		it('builds url with params and query', async () => {
			const responseBody = { ok: true };
			const baseUrl = import.meta.env.VITE_API_URL;
			mockFetchJsonResponse({ status: 200, body: responseBody });

			await createHTTPRequest({
				path: '/poems',
				params: [1, 'slug'],
				query: { q: 'hello', tags: ['a', 'b'], empty: undefined },
			});

			expect(globalThis.fetch).toHaveBeenCalledWith(
				`${baseUrl}/poems/1/slug?q=hello&tags=a&tags=b`,
				expect.objectContaining({ method: 'GET' }),
			);
		});

		it('adds json headers and csrf token for unsafe methods', async () => {
			const baseUrl = import.meta.env.VITE_API_URL;
			globalThis.document = { cookie: 'csrf_token=abc123' } as Document;
			mockFetchJsonResponse({ status: 200, body: { ok: true } });

			await createHTTPRequest({
				path: '/users',
				method: 'POST',
				body: { name: 'Ana' },
				headers: { 'x-custom': 'yes' },
			});

			expect(globalThis.fetch).toHaveBeenCalledWith(
				`${baseUrl}/users`,
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'x-csrf-token': 'abc123',
						'x-custom': 'yes',
					}),
					body: JSON.stringify({ name: 'Ana' }),
				}),
			);
		});

		it('throws AppErrorType on non-2xx responses', async () => {
			mockFetchJsonResponse({
				status: 404,
				body: { message: 'Not found', code: 'NOT_FOUND' },
			});

			await expect(createHTTPRequest({ path: '/missing' })).rejects.toMatchObject({
				statusCode: 404,
				message: 'Not found',
				code: 'NOT_FOUND',
			});
		});
	});
});
