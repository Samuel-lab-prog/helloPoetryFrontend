import { eventBus } from '@root/core/events/eventBus';
import { registerAuthSessionPort } from '@root/core/ports/authSession';

import { createHTTPRequest } from './createHttpRequest';

const realFetch = globalThis.fetch;

function jsonResponse(status: number, body: unknown) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

describe('createHTTPRequest session integration', () => {
	const session = {
		getCurrentIdentity: vi.fn(() => ({ id: 987, status: 'active' })),
		getCurrentCacheScope: vi.fn(() => 'user:987:active'),
		setUnreadNotificationsCount: vi.fn(),
		clearAuthClient: vi.fn(),
	};

	beforeEach(() => {
		import.meta.env.VITE_API_URL = 'https://api.test';
		registerAuthSessionPort(session);
		vi.clearAllMocks();
	});

	afterEach(() => {
		globalThis.fetch = realFetch;
		vi.restoreAllMocks();
	});

	it('clears an active session and publishes logout after refresh fails for an expired 401', async () => {
		const fetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { code: 'UNAUTHORIZED', message: 'expired' }))
			.mockResolvedValueOnce(new Response(null, { status: 503 }));
		globalThis.fetch = fetch as typeof globalThis.fetch;
		const publish = vi.spyOn(eventBus, 'publish').mockResolvedValue(undefined);

		await expect(createHTTPRequest({ path: '/users/me' })).rejects.toMatchObject({
			statusCode: 401,
			code: 'UNAUTHORIZED',
		});

		expect(session.clearAuthClient).toHaveBeenCalledOnce();
		expect(publish).toHaveBeenCalledWith(
			'userLoggedOut',
			expect.objectContaining({ userId: 987, reason: 'sessionExpired' }),
		);
	});

	it('does not clear a banned session when its 401 response explicitly identifies a ban', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { code: 'BANNED', message: 'account banned' }))
			.mockResolvedValueOnce(new Response(null, { status: 503 })) as typeof globalThis.fetch;
		const publish = vi.spyOn(eventBus, 'publish').mockResolvedValue(undefined);

		await expect(createHTTPRequest({ path: '/users/me' })).rejects.toMatchObject({
			statusCode: 401,
			code: 'BANNED',
		});

		expect(session.clearAuthClient).not.toHaveBeenCalled();
		expect(publish).not.toHaveBeenCalled();
	});

	it('retries the original request after refresh succeeds without clearing the session', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse(401, { code: 'UNAUTHORIZED', message: 'expired' }))
			.mockResolvedValueOnce(new Response(null, { status: 200 }))
			.mockResolvedValueOnce(jsonResponse(200, { ok: true })) as typeof globalThis.fetch;

		await expect(createHTTPRequest({ path: '/users/me' })).resolves.toEqual({ ok: true });
		expect(globalThis.fetch).toHaveBeenCalledTimes(3);
		expect(session.clearAuthClient).not.toHaveBeenCalled();
	});
});
