import { expect, type Page, type Request, type Route } from '@playwright/test';

import { signedInSessionPoem, signedInSessionProfile } from './fixtures';

type PublicAuthPageRequest = {
	method: string;
	url: string;
};

type MockApiFailure = {
	json: {
		code: string;
		message: string;
	};
	status: number;
};

type MockLoggedOutAuthPagesOptions = {
	loginFailure?: MockApiFailure;
	registerFailure?: MockApiFailure;
};

export type AuthPagesMock = {
	allowedPublicRequests: PublicAuthPageRequest[];
	loginRequests: PublicAuthPageRequest[];
	registerRequests: PublicAuthPageRequest[];
	unexpectedApiRequests: PublicAuthPageRequest[];
};

export type SignOutSessionMock = {
	loginRequests: PublicAuthPageRequest[];
	privateRequests: PublicAuthPageRequest[];
	unexpectedApiRequests: PublicAuthPageRequest[];
};

export type ExpiredSessionMock = {
	expireSession: () => void;
	loginRequests: PublicAuthPageRequest[];
	expiredPrivateRequests: PublicAuthPageRequest[];
	privateRequests: PublicAuthPageRequest[];
	profileUpdateRequests: PublicAuthPageRequest[];
	refreshRequests: PublicAuthPageRequest[];
	unexpectedApiRequests: PublicAuthPageRequest[];
};

const allowedPublicPaths = new Set(['/api/v1/users/check-email', '/api/v1/users/check-nickname']);
const privateHrefs = ['/poems/new', '/my-profile', '/notifications', '/admin', '/admin/moderation'];
const expiredSessionResponse = {
	code: 'UNAUTHORIZED',
	message: 'Session expired',
};

function recordRequest(request: Request): PublicAuthPageRequest {
	return {
		method: request.method(),
		url: request.url(),
	};
}

async function fulfillSignedInLogin(route: Route, request: Request) {
	await route.fulfill({
		status: 200,
		json: {
			id: signedInSessionProfile.id,
			role: signedInSessionProfile.role,
			status: signedInSessionProfile.status,
		},
	});
	return recordRequest(request);
}

async function fulfillSignedInPrivateRead(
	route: Route,
	request: Request,
	path: string,
	privateRequests: PublicAuthPageRequest[],
): Promise<boolean> {
	if (request.method() === 'GET' && path === `/api/v1/users/${signedInSessionProfile.id}/profile`) {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: signedInSessionProfile });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/friends/requests') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: { received: [], sent: [] } });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/poems/me') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: [signedInSessionPoem] });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/poems/saved') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: [] });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/poems/collections') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: [] });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/feed') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({ status: 200, json: [] });
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/notifications') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({
			status: 200,
			json: {
				notifications: [],
				hasMore: false,
				nextCursor: undefined,
			},
		});
		return true;
	}

	if (request.method() === 'GET' && path === '/api/v1/users') {
		privateRequests.push(recordRequest(request));
		await route.fulfill({
			status: 200,
			json: {
				users: [],
				hasMore: false,
				nextCursor: undefined,
			},
		});
		return true;
	}

	return false;
}

export async function getPersistedAuthClient(page: Page) {
	return page.evaluate(() => {
		const raw = window.localStorage.getItem('auth-client');
		if (!raw) return null;
		return JSON.parse(raw).authClient ?? null;
	});
}

export async function expectLoggedOutNavbar(page: Page) {
	await expect(page.locator('a[href="/login"]').first()).toBeVisible();
	await expect(page.locator('a[href="/register"]').first()).toBeVisible();

	for (const href of privateHrefs) {
		await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
	}
}

export async function mockLoggedOutAuthPages(
	page: Page,
	options: MockLoggedOutAuthPagesOptions = {},
): Promise<AuthPagesMock> {
	const allowedPublicRequests: PublicAuthPageRequest[] = [];
	const loginRequests: PublicAuthPageRequest[] = [];
	const registerRequests: PublicAuthPageRequest[] = [];
	const unexpectedApiRequests: PublicAuthPageRequest[] = [];

	await page.route('**/api/v1/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const isAllowedPublicRequest =
			request.method() === 'GET' && allowedPublicPaths.has(url.pathname);

		if (isAllowedPublicRequest) {
			allowedPublicRequests.push(recordRequest(request));
			await route.fulfill({ status: 200, json: false });
			return;
		}

		if (
			options.loginFailure &&
			request.method() === 'POST' &&
			url.pathname === '/api/v1/auth/login'
		) {
			loginRequests.push(recordRequest(request));
			await route.fulfill({
				status: options.loginFailure.status,
				json: options.loginFailure.json,
			});
			return;
		}

		if (
			options.registerFailure &&
			request.method() === 'POST' &&
			url.pathname === '/api/v1/users'
		) {
			registerRequests.push(recordRequest(request));
			await route.fulfill({
				status: options.registerFailure.status,
				json: options.registerFailure.json,
			});
			return;
		}

		unexpectedApiRequests.push(recordRequest(request));
		await route.fulfill({
			status: 403,
			json: { code: 'UNEXPECTED_TEST_REQUEST', message: 'Unexpected API request' },
		});
	});

	return {
		allowedPublicRequests,
		loginRequests,
		registerRequests,
		unexpectedApiRequests,
	};
}

export async function mockSignOutSession(page: Page): Promise<SignOutSessionMock> {
	const loginRequests: PublicAuthPageRequest[] = [];
	const privateRequests: PublicAuthPageRequest[] = [];
	const unexpectedApiRequests: PublicAuthPageRequest[] = [];

	await page.route('**/api/v1/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const path = url.pathname;

		if (request.method() === 'POST' && path === '/api/v1/auth/login') {
			loginRequests.push(await fulfillSignedInLogin(route, request));
			return;
		}

		if (await fulfillSignedInPrivateRead(route, request, path, privateRequests)) return;

		unexpectedApiRequests.push(recordRequest(request));
		await route.fulfill({
			status: 403,
			json: { code: 'UNEXPECTED_TEST_REQUEST', message: 'Unexpected API request' },
		});
	});

	return {
		loginRequests,
		privateRequests,
		unexpectedApiRequests,
	};
}

export async function mockExpiredSession(page: Page): Promise<ExpiredSessionMock> {
	let sessionExpired = false;
	const loginRequests: PublicAuthPageRequest[] = [];
	const expiredPrivateRequests: PublicAuthPageRequest[] = [];
	const privateRequests: PublicAuthPageRequest[] = [];
	const profileUpdateRequests: PublicAuthPageRequest[] = [];
	const refreshRequests: PublicAuthPageRequest[] = [];
	const unexpectedApiRequests: PublicAuthPageRequest[] = [];

	await page.route('**/api/v1/**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		const path = url.pathname;

		if (request.method() === 'POST' && path === '/api/v1/auth/login') {
			loginRequests.push(await fulfillSignedInLogin(route, request));
			return;
		}

		if (request.method() === 'POST' && path === '/api/v1/auth/refresh') {
			refreshRequests.push(recordRequest(request));
			await route.fulfill({
				status: 401,
				json: expiredSessionResponse,
			});
			return;
		}

		if (
			sessionExpired &&
			request.method() === 'PATCH' &&
			path === `/api/v1/users/${signedInSessionProfile.id}`
		) {
			profileUpdateRequests.push(recordRequest(request));
			await route.fulfill({
				status: 401,
				json: expiredSessionResponse,
			});
			return;
		}

		if (sessionExpired) {
			expiredPrivateRequests.push(recordRequest(request));
			await route.fulfill({
				status: 401,
				json: expiredSessionResponse,
			});
			return;
		}

		if (await fulfillSignedInPrivateRead(route, request, path, privateRequests)) return;

		unexpectedApiRequests.push(recordRequest(request));
		await route.fulfill({
			status: 403,
			json: { code: 'UNEXPECTED_TEST_REQUEST', message: 'Unexpected API request' },
		});
	});

	return {
		expireSession: () => {
			sessionExpired = true;
		},
		expiredPrivateRequests,
		loginRequests,
		privateRequests,
		profileUpdateRequests,
		refreshRequests,
		unexpectedApiRequests,
	};
}
