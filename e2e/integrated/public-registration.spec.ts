import { expect, type Page, test } from '@playwright/test';

const API_URL = 'http://127.0.0.1:5101/api/v1';

type RegistrationBody = {
	name: string;
	nickname: string;
	email: string;
	password: string;
	bio: string;
};

async function postRegistration(page: Page, body: RegistrationBody, csrfHeader?: string) {
	return page.evaluate(
		async ({ apiUrl, registrationBody, token }) => {
			const headers = new Headers({ 'content-type': 'application/json' });
			if (token !== undefined) headers.set('x-csrf-token', token);

			const response = await fetch(`${apiUrl}/users`, {
				method: 'POST',
				credentials: 'include',
				headers,
				body: JSON.stringify(registrationBody),
			});
			return {
				status: response.status,
				body: await response.json(),
			};
		},
		{ apiUrl: API_URL, registrationBody: body, token: csrfHeader },
	);
}

test('a public visitor obtains CSRF protection and registers without being signed in', async ({
	page,
}) => {
	const suffix = `${Date.now()}`;
	const registration: RegistrationBody = {
		name: 'Public E2E Poet',
		nickname: `public_${suffix}`,
		email: `public-${suffix}@hello-poetry.test`,
		password: 'HelloPoetry-Registration-E2E',
		bio: 'Created through the public integrated registration journey.',
	};

	await page.goto('/register');
	await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
	expect(await page.evaluate(() => window.localStorage.getItem('auth-client'))).toBeNull();
	expect(
		await page.evaluate(() =>
			document.cookie.split(';').some((cookie) => cookie.trim().startsWith('csrf_token=')),
		),
	).toBe(false);

	const rejectedWithoutToken = await postRegistration(page, registration);
	expect(rejectedWithoutToken.status).toBe(403);
	expect(rejectedWithoutToken.body).toMatchObject({
		message: 'CSRF token is missing or invalid',
	});

	const bootstrap = await page.evaluate(async (apiUrl) => {
		const response = await fetch(`${apiUrl}/auth/csrf`, { credentials: 'include' });
		const body = (await response.json()) as { csrfToken: string };
		const cookieToken = document.cookie
			.split(';')
			.map((cookie) => cookie.trim())
			.find((cookie) => cookie.startsWith('csrf_token='))
			?.slice('csrf_token='.length);
		return { status: response.status, token: body.csrfToken, cookieToken };
	}, API_URL);
	expect(bootstrap.status).toBe(200);
	expect(bootstrap.token).toBeTruthy();
	expect(bootstrap.cookieToken).toBe(bootstrap.token);

	const rejectedWithInvalidToken = await postRegistration(page, registration, 'invalid-csrf-token');
	expect(rejectedWithInvalidToken.status).toBe(403);
	expect(rejectedWithInvalidToken.body).toMatchObject({
		message: 'CSRF token is missing or invalid',
	});

	const csrfResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === '/api/v1/auth/csrf',
	);
	const createUserResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/users',
	);
	await page.getByRole('textbox', { name: 'Nickname' }).fill(registration.nickname);
	await page.getByRole('textbox', { name: 'Name', exact: true }).fill(registration.name);
	await page.getByRole('textbox', { name: 'Email' }).fill(registration.email);
	await page.getByLabel('Password').fill(registration.password);
	await page.getByRole('textbox', { name: 'Bio' }).fill(registration.bio);
	await page.getByRole('button', { name: 'Create account' }).click();

	const csrfResponse = await csrfResponsePromise;
	expect(csrfResponse.status()).toBe(200);
	const issuedToken = ((await csrfResponse.json()) as { csrfToken: string }).csrfToken;
	const createUserResponse = await createUserResponsePromise;
	expect(createUserResponse.status()).toBe(201);
	expect(createUserResponse.request().headers()['x-csrf-token']).toBe(issuedToken);
	await expect(page).toHaveURL(/\/login$/);

	const sessionState = await page.evaluate(() => ({
		authClient: window.localStorage.getItem('auth-client'),
		cookieNames: document.cookie
			.split(';')
			.map((cookie) => cookie.trim().split('=')[0])
			.filter(Boolean),
	}));
	expect(sessionState.authClient).toBeNull();
	expect(sessionState.cookieNames).toContain('csrf_token');
	const cookieNames = (await page.context().cookies()).map((cookie) => cookie.name);
	expect(cookieNames).not.toContain('token');
	expect(cookieNames).not.toContain('refreshToken');

	const duplicateNickname = await postRegistration(
		page,
		{
			...registration,
			nickname: registration.nickname,
			email: `another-${suffix}@hello-poetry.test`,
		},
		issuedToken,
	);
	expect(duplicateNickname.status).toBe(409);
	expect(duplicateNickname.body).toMatchObject({ message: 'Nickname already in use' });

	const duplicateEmail = await postRegistration(
		page,
		{
			...registration,
			nickname: `another_${suffix}`,
			email: registration.email,
		},
		issuedToken,
	);
	expect(duplicateEmail.status).toBe(409);
	expect(duplicateEmail.body).toMatchObject({ message: 'Email already in use' });

	await page.goto('/register');
	await page.getByRole('textbox', { name: 'Nickname' }).fill(registration.nickname);
	await page.getByRole('textbox', { name: 'Email' }).fill(`fresh-${suffix}@hello-poetry.test`);
	await expect(page.getByText('Nickname is already in use')).toBeVisible();

	await page.goto('/register');
	await page.getByRole('textbox', { name: 'Nickname' }).fill(`fresh_${suffix}`);
	await page.getByRole('textbox', { name: 'Email' }).fill(registration.email);
	await expect(page.getByText('Email is already in use')).toBeVisible();
	expect(await page.evaluate(() => window.localStorage.getItem('auth-client'))).toBeNull();
});
