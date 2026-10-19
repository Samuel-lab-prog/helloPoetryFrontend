import { expect, test } from '@playwright/test';

const API_URL = 'http://127.0.0.1:5101/api/v1';
const account = {
	email: 'e2e-author@hello-poetry.test',
	password: 'HelloPoetry-E2E-Only-2026',
};
const nextAccount = {
	email: 'e2e-reader@hello-poetry.test',
	password: 'HelloPoetry-E2E-Only-2026',
};

test('logout expires browser cookies and prevents refresh without a refresh cookie', async ({
	page,
}) => {
	await page.goto('/login');
	await page.getByLabel('Email').fill(account.email);
	await page.getByLabel('Password').fill(account.password);
	const loginResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/auth/login',
	);
	await page.getByRole('button', { name: 'Sign in' }).click();
	const loginResponse = await loginResponsePromise;
	expect(loginResponse.status()).toBe(200);
	const firstClient = (await loginResponse.json()) as { id: number };
	await expect(page).toHaveURL('/');

	const authenticatedCookies = await page.context().cookies();
	const accessCookie = authenticatedCookies.find((cookie) => cookie.name === 'token');
	const refreshCookie = authenticatedCookies.find((cookie) => cookie.name === 'refreshToken');
	const csrfCookie = authenticatedCookies.find((cookie) => cookie.name === 'csrf_token');
	expect(accessCookie?.httpOnly).toBe(true);
	expect(refreshCookie?.httpOnly).toBe(true);
	expect(csrfCookie?.httpOnly).toBe(false);
	expect(csrfCookie?.value).toBeTruthy();
	expect(accessCookie).toBeDefined();
	expect(refreshCookie).toBeDefined();
	expect(csrfCookie).toBeDefined();

	await page.goto('/my-profile');
	const logoutResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/auth/logout',
	);
	await page.getByRole('button', { name: 'Sign out' }).click();
	const logoutResponse = await logoutResponsePromise;
	expect(logoutResponse.status()).toBe(200);
	expect(logoutResponse.request().headers()['x-csrf-token']).toBe(csrfCookie?.value);
	await expect(page).toHaveURL(/\/login$/);

	const remainingCookies = await page.context().cookies();
	expect(remainingCookies.map((cookie) => cookie.name)).not.toContain('token');
	expect(remainingCookies.map((cookie) => cookie.name)).not.toContain('refreshToken');
	expect(remainingCookies.map((cookie) => cookie.name)).not.toContain('csrf_token');
	const persistedAuthState = await page.evaluate(() => {
		const raw = window.localStorage.getItem('auth-client');
		return raw
			? (JSON.parse(raw) as { authClient?: unknown; unreadNotificationsCount?: number })
			: null;
	});
	expect(persistedAuthState?.authClient ?? null).toBeNull();
	expect(persistedAuthState?.unreadNotificationsCount ?? 0).toBe(0);

	await page.goto('/my-profile');
	await expect(page.getByText('Sign in to view your profile', { exact: true })).toBeVisible();

	const refreshStatus = await page.evaluate(async (apiUrl) => {
		const csrfResponse = await fetch(`${apiUrl}/auth/csrf`, { credentials: 'include' });
		const { csrfToken } = (await csrfResponse.json()) as { csrfToken: string };
		const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'x-csrf-token': csrfToken },
		});
		return refreshResponse.status;
	}, API_URL);
	expect(refreshStatus).toBe(422);

	const cookiesAfterRefreshAttempt = await page.context().cookies();
	expect(cookiesAfterRefreshAttempt.map((cookie) => cookie.name)).not.toContain('token');
	expect(cookiesAfterRefreshAttempt.map((cookie) => cookie.name)).not.toContain('refreshToken');

	await page.goto('/login');
	await page.getByLabel('Email').fill(nextAccount.email);
	await page.getByLabel('Password').fill(nextAccount.password);
	const nextLoginResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/auth/login',
	);
	await page.getByRole('button', { name: 'Sign in' }).click();
	const nextLoginResponse = await nextLoginResponsePromise;
	expect(nextLoginResponse.status()).toBe(200);
	const nextClient = (await nextLoginResponse.json()) as { id: number };
	expect(nextClient.id).not.toBe(firstClient.id);
	await expect(page).toHaveURL('/');
	await page.goto('/my-profile');
	await expect(page.getByText('E2E Reader', { exact: true })).toBeVisible();
});
