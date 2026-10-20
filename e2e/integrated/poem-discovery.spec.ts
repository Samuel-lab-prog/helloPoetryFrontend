import { expect, type Page, test } from '@playwright/test';

const API_URL = 'http://127.0.0.1:5101/api/v1';
const password = 'HelloPoetry-E2E-Only-2026';
const accounts = {
	author: { email: 'e2e-author@hello-poetry.test', password },
	moderator: { email: 'e2e-moderator@hello-poetry.test', password },
};

type CreatedPoem = { id: number; title: string; moderationStatus: string };

async function signIn(page: Page, account: { email: string; password: string }) {
	await page.goto('/login');
	await page.getByLabel('Email').fill(account.email);
	await page.getByLabel('Password').fill(account.password);
	const loginResponse = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/auth/login',
	);
	await page.getByRole('button', { name: 'Sign in' }).click();
	expect((await loginResponse).status()).toBe(200);
	await expect(page).toHaveURL('/');
}

async function signOut(page: Page) {
	await page.goto('/my-profile');
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/login$/);
}

async function expectQueryParam(page: Page, name: string, value: string) {
	await expect.poll(() => new URL(page.url()).searchParams.get(name)).toBe(value);
}

async function expectQueryParams(page: Page, name: string, values: string[]) {
	await expect.poll(() => new URL(page.url()).searchParams.getAll(name)).toEqual(values);
}

async function clearSearchFilters(page: Page) {
	await page.getByRole('button', { name: 'Clear all filters' }).click();
	await expect(page.getByRole('button', { name: 'Clear all filters' })).toHaveCount(0);
	await expect
		.poll(() => {
			const params = new URL(page.url()).searchParams;
			return params.has('q') || params.has('tag') || params.has('order');
		})
		.toBe(false);
}

async function requestApi<T>(page: Page, method: 'POST' | 'PATCH', path: string, body: unknown) {
	return page.evaluate(
		async ({ apiUrl, requestMethod, requestPath, requestBody }) => {
			const csrfToken = document.cookie
				.split(';')
				.map((cookie) => cookie.trim())
				.find((cookie) => cookie.startsWith('csrf_token='))
				?.slice('csrf_token='.length);
			const response = await fetch(`${apiUrl}${requestPath}`, {
				method: requestMethod,
				credentials: 'include',
				headers: {
					'content-type': 'application/json',
					...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
				},
				body: JSON.stringify(requestBody),
			});
			return { status: response.status, body: await response.json() };
		},
		{ apiUrl: API_URL, requestMethod: method, requestPath: path, requestBody: body },
	) as Promise<{ status: number; body: T }>;
}

async function createPoem(
	page: Page,
	input: { title: string; tags: string[]; visibility?: string },
) {
	const response = await requestApi<CreatedPoem>(page, 'POST', '/poems', {
		title: input.title,
		excerpt: `A test excerpt for ${input.title}`,
		content: `A disposable poem for ${input.title}.`,
		tags: input.tags,
		status: 'published',
		visibility: input.visibility ?? 'public',
		isCommentable: true,
	});
	expect(response.status, `Poem creation failed for ${input.title}`).toBe(201);
	return response.body;
}

async function moderatePoem(page: Page, poemId: number, moderationStatus: 'approved' | 'rejected') {
	const result = await requestApi(page, 'PATCH', `/moderation/poems/${poemId}`, {
		moderationStatus,
	});
	expect(result.status).toBe(200);
}

test('public discovery filters, pagination, URL state, feed, and visibility work end to end', async ({
	page,
}) => {
	const runId = Date.now().toString();
	const batchPrefix = `Discovery ${runId} Batch`;
	const moderatorTitles = Array.from({ length: 22 }, (_, index) => {
		return `${batchPrefix} ${index.toString().padStart(2, '0')}`;
	});

	await signIn(page, accounts.moderator);
	// Create in order because the real API uses nested connect-or-create for shared tags.
	await moderatorTitles.reduce<Promise<void>>(
		(previous, title, index) =>
			previous.then(async () => {
				await createPoem(page, {
					title,
					tags: ['disc-shared', index === 0 ? 'disc-nature' : 'disc-batch'],
				});
			}),
		Promise.resolve(),
	);
	const tagNature = await createPoem(page, {
		title: `Discovery Tag ${runId} Nature`,
		tags: ['disc-nature'],
	});
	const tagMusic = await createPoem(page, {
		title: `Discovery Tag ${runId} Music`,
		tags: ['disc-music'],
	});
	const visibleGuard = await createPoem(page, {
		title: `Discovery Visibility ${runId} Public`,
		tags: ['disc-guard'],
	});
	await createPoem(page, {
		title: `Discovery Visibility ${runId} Private`,
		tags: ['disc-guard'],
		visibility: 'private',
	});
	await createPoem(page, {
		title: `Discovery Visibility ${runId} Friends`,
		tags: ['disc-guard'],
		visibility: 'friends',
	});
	await createPoem(page, {
		title: `Discovery Visibility ${runId} Unlisted`,
		tags: ['disc-guard'],
		visibility: 'unlisted',
	});

	await signOut(page);
	await signIn(page, accounts.author);
	const pendingPoem = await createPoem(page, {
		title: `Discovery Visibility ${runId} Pending`,
		tags: ['disc-guard'],
	});
	expect(pendingPoem.moderationStatus).toBe('pending');
	const rejectedPoem = await createPoem(page, {
		title: `Discovery Visibility ${runId} Rejected`,
		tags: ['disc-guard'],
	});
	expect(rejectedPoem.moderationStatus).toBe('pending');
	await signOut(page);
	await signIn(page, accounts.moderator);
	await moderatePoem(page, rejectedPoem.id, 'rejected');

	await signOut(page);
	const initialFeedResponse = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === '/api/v1/poems' &&
			!new URL(response.url()).searchParams.has('searchTitle'),
	);
	await page.goto('/');
	const feedResponse = await initialFeedResponse;
	expect(feedResponse.ok()).toBeTruthy();
	const feedTitles = ((await feedResponse.json()) as { poems: { title: string }[] }).poems.map(
		(poem) => poem.title,
	);
	expect(feedTitles).not.toContain(`Discovery Visibility ${runId} Private`);
	expect(feedTitles).not.toContain(`Discovery Visibility ${runId} Friends`);
	expect(feedTitles).not.toContain(`Discovery Visibility ${runId} Unlisted`);
	expect(feedTitles).not.toContain(`Discovery Visibility ${runId} Pending`);
	expect(feedTitles).not.toContain(`Discovery Visibility ${runId} Rejected`);
	await expect(page.getByText(tagMusic.title, { exact: true })).toBeVisible();
	await expect(
		page.getByText(`Discovery Visibility ${runId} Private`, { exact: true }),
	).toHaveCount(0);

	const guardRequest = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === '/api/v1/poems' &&
			new URL(response.url()).searchParams.get('searchTitle') === `Discovery Visibility ${runId}`,
	);
	await page.getByRole('textbox', { name: 'Search poems' }).fill(`Discovery Visibility ${runId}`);
	const guardResponse = await guardRequest;
	const guardTitles = ((await guardResponse.json()) as { poems: { title: string }[] }).poems.map(
		(poem) => poem.title,
	);
	expect(guardTitles).toEqual([`Discovery Visibility ${runId} Public`]);
	await expect(
		page.getByText(`Discovery Visibility ${runId} Public`, { exact: true }),
	).toBeVisible();
	await Promise.all(
		['Private', 'Friends', 'Unlisted', 'Pending', 'Rejected'].map((suffix) =>
			expect(
				page.getByText(`Discovery Visibility ${runId} ${suffix}`, { exact: true }),
			).toHaveCount(0),
		),
	);
	await clearSearchFilters(page);

	await page.getByRole('textbox', { name: 'Search poems' }).fill(`Discovery Tag ${runId}`);
	await expectQueryParam(page, 'q', `Discovery Tag ${runId}`);
	await page.getByPlaceholder('Enter tag').fill('disc-nature');
	await page.getByRole('button', { name: 'Add tag' }).click();
	await expectQueryParams(page, 'tag', ['disc-nature']);
	await expect(page.getByText(tagNature.title, { exact: true })).toBeVisible();
	await expect(page.getByText(tagMusic.title, { exact: true })).toHaveCount(0);
	await expectQueryParam(page, 'q', `Discovery Tag ${runId}`);
	await page.reload();
	await expect(page.getByText(tagNature.title, { exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove tag disc-nature' })).toBeVisible();
	await clearSearchFilters(page);

	await page.getByPlaceholder('Enter tag').fill('disc-nature');
	await page.getByRole('button', { name: 'Add tag' }).click();
	await expectQueryParams(page, 'tag', ['disc-nature']);
	await expect(page.getByRole('button', { name: 'Remove tag disc-nature' })).toBeVisible();
	await page.getByPlaceholder('Enter tag').fill('disc-music');
	await page.getByRole('button', { name: 'Add tag' }).click();
	await expectQueryParams(page, 'tag', ['disc-nature', 'disc-music']);
	await expect(page.getByRole('button', { name: 'Remove tag disc-music' })).toBeVisible();
	await expect(page.getByText(tagNature.title, { exact: true })).toBeVisible();
	await expect(page.getByText(tagMusic.title, { exact: true })).toBeVisible();
	await expect(page.getByText(visibleGuard.title, { exact: true })).toHaveCount(0);
	await clearSearchFilters(page);

	await page.getByRole('textbox', { name: 'Search poems' }).fill(batchPrefix);
	await expectQueryParam(page, 'q', batchPrefix);
	const ascendingResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).searchParams.get('searchTitle') === batchPrefix &&
			new URL(response.url()).searchParams.get('orderDirection') === 'asc',
	);
	await page.getByLabel('Sort results').selectOption('title:asc');
	const ascendingResponse = await ascendingResponsePromise;
	const ascendingTitles = (
		(await ascendingResponse.json()) as { poems: { title: string }[] }
	).poems.map((poem) => poem.title);
	expect(ascendingTitles).toEqual(moderatorTitles.slice(0, 20));
	await expect(page.getByText(moderatorTitles[0], { exact: true })).toBeVisible();
	await expect(page.getByText(moderatorTitles[20], { exact: true })).toHaveCount(0);
	await page.getByRole('button', { name: 'Load more poems' }).click();
	await expect(page.getByText(moderatorTitles[21], { exact: true })).toBeVisible();
	const descendingResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).searchParams.get('searchTitle') === batchPrefix &&
			new URL(response.url()).searchParams.get('orderDirection') === 'desc',
	);
	await page.getByLabel('Sort results').selectOption('title:desc');
	const descendingResponse = await descendingResponsePromise;
	const descendingTitles = (
		(await descendingResponse.json()) as { poems: { title: string }[] }
	).poems.map((poem) => poem.title);
	expect(descendingTitles).toEqual(moderatorTitles.slice().reverse().slice(0, 20));
	await expect(page.getByText(moderatorTitles[21], { exact: true })).toBeVisible();

	await clearSearchFilters(page);
	await page.getByRole('textbox', { name: 'Search poems' }).fill(`Discovery Tag ${runId}`);
	await expectQueryParam(page, 'q', `Discovery Tag ${runId}`);
	await page.getByRole('button', { name: 'Search poems tagged disc-music' }).click();
	await expect(page).toHaveURL(new RegExp(`[?&]tag=disc-music`));
	await expect(page.getByText(tagMusic.title, { exact: true })).toBeVisible();
	await expect(page.getByText(tagNature.title, { exact: true })).toHaveCount(0);
});
