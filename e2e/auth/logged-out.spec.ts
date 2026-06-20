import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { mockLoggedOutAuthPages } from './helpers';

async function getStoredAuthClient(page: Parameters<typeof clearClientAuth>[0]) {
	return page.evaluate(() => window.localStorage.getItem('auth-client'));
}

test.describe('logged out auth pages', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('keeps the login page public without calling private APIs before submit', async ({
		page,
	}) => {
		const authMock = await mockLoggedOutAuthPages(page);

		await page.goto('/login');

		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
		await expect(page.getByText('Enter your credentials to sign in.')).toBeVisible();
		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Create account' })).toHaveAttribute(
			'href',
			'/register',
		);
		await expect(page.getByText('Sign in to view')).not.toBeVisible();

		await page.getByLabel('Email').fill('reader@example.com');
		await page.getByLabel('Password').fill('password123');

		expect(authMock.allowedPublicRequests).toEqual([]);
		expect(authMock.loginRequests).toEqual([]);
		expect(authMock.registerRequests).toEqual([]);
		expect(authMock.unexpectedApiRequests).toEqual([]);
	});

	test('shows a clear login failure without storing an authenticated client', async ({ page }) => {
		const authMock = await mockLoggedOutAuthPages(page, {
			loginFailure: {
				status: 401,
				json: {
					code: 'UNAUTHORIZED',
					message: 'Invalid credentials',
				},
			},
		});

		await page.goto('/login');
		await page.getByLabel('Email').fill('reader@example.com');
		await page.getByLabel('Password').fill('wrong-password');
		await page.getByRole('button', { name: 'Sign in' }).click();

		await expect(page.getByText('Incorrect credentials').first()).toBeVisible();
		await expect(page).toHaveURL(/\/login$/);
		await expect.poll(() => authMock.loginRequests.length).toBe(1);

		expect(await getStoredAuthClient(page)).toBeNull();
		expect(authMock.registerRequests).toEqual([]);
		expect(authMock.unexpectedApiRequests).toEqual([]);
	});

	test('keeps the register page public and only runs public availability checks before submit', async ({
		page,
	}) => {
		const authMock = await mockLoggedOutAuthPages(page);

		await page.goto('/register');

		await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
		await expect(page.getByText('Fill in your details to create your account.')).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Nickname' })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Bio' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
		await expect(page.getByRole('main').getByRole('link', { name: 'Sign in' })).toHaveAttribute(
			'href',
			'/login',
		);
		await expect(page.getByText('Sign in to create')).not.toBeVisible();

		await page.getByRole('textbox', { name: 'Nickname' }).fill('public_reader');
		await page.getByRole('textbox', { name: 'Email' }).fill('public.reader@example.com');

		await expect
			.poll(() =>
				authMock.allowedPublicRequests.map((request) => {
					const url = new URL(request.url);
					return url.pathname;
				}),
			)
			.toEqual(
				expect.arrayContaining(['/api/v1/users/check-nickname', '/api/v1/users/check-email']),
			);

		expect(authMock.loginRequests).toEqual([]);
		expect(authMock.registerRequests).toEqual([]);
		expect(authMock.unexpectedApiRequests).toEqual([]);
	});

	test('shows a clear register failure without creating an authenticated session', async ({
		page,
	}) => {
		const authMock = await mockLoggedOutAuthPages(page, {
			registerFailure: {
				status: 409,
				json: {
					code: 'CONFLICT',
					message: 'Nickname already exists',
				},
			},
		});

		await page.goto('/register');
		await page.getByRole('textbox', { name: 'Nickname' }).fill('public_reader');
		await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Public Reader');
		await page.getByRole('textbox', { name: 'Email' }).fill('public.reader@example.com');
		await page.getByLabel('Password').fill('password123');

		const createAccountButton = page.getByRole('button', { name: 'Create account' });
		await expect(createAccountButton).toBeEnabled();
		await createAccountButton.click();

		await expect(page.getByText('This nickname is already in use.')).toBeVisible();
		await expect(page).toHaveURL(/\/register$/);
		await expect.poll(() => authMock.registerRequests.length).toBe(1);

		expect(await getStoredAuthClient(page)).toBeNull();
		expect(authMock.loginRequests).toEqual([]);
		expect(authMock.unexpectedApiRequests).toEqual([]);
	});
});
