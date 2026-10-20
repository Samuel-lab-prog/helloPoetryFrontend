import { expect, type Page, test } from '@playwright/test';

const accounts = {
	author: {
		email: 'e2e-author@hello-poetry.test',
		password: 'HelloPoetry-E2E-Only-2026',
	},
	reader: {
		email: 'e2e-reader@hello-poetry.test',
		password: 'HelloPoetry-E2E-Only-2026',
	},
	moderator: {
		email: 'e2e-moderator@hello-poetry.test',
		password: 'HelloPoetry-E2E-Only-2026',
	},
};

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
	const response = await loginResponse;
	expect(response.status()).toBe(200);
	await expect(page).toHaveURL('/');
}

async function signOut(page: Page) {
	await page.goto('/my-profile');
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/login$/);
}

test('prepared author publishes a poem that a second account can read and interact with', async ({
	page,
}) => {
	await signIn(page, accounts.author);

	const poemTitle = `E2E Poem ${Date.now()}`;
	const poemContent = 'A disposable poem created by the integrated end-to-end journey.';
	await page.goto('/poems/new');
	await page.getByLabel('Title').fill(poemTitle);
	await page.getByLabel('Summary').fill('A short summary for the integrated E2E poem.');
	await page.getByLabel('Content (Markdown)').fill(poemContent);
	await page.getByLabel('Status').selectOption('published');

	const createResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/poems',
	);
	await page.getByRole('button', { name: 'Create Poem' }).click();
	const createResponse = await createResponsePromise;
	expect(createResponse.status()).toBe(201);
	const createdPoem = (await createResponse.json()) as {
		id: number;
		slug: string;
		moderationStatus: string;
	};
	expect(createdPoem.id).toBeGreaterThan(0);
	expect(createdPoem.moderationStatus).toBe('pending');

	await signOut(page);
	await signIn(page, accounts.moderator);
	await page.goto('/admin/moderation');
	await expect(page.getByRole('heading', { name: poemTitle })).toBeVisible();
	const moderationResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'PATCH' &&
			new URL(response.url()).pathname === `/api/v1/moderation/poems/${createdPoem.id}`,
	);
	await page.getByRole('button', { name: 'Approve' }).click();
	expect((await moderationResponsePromise).ok()).toBeTruthy();

	await signOut(page);
	await signIn(page, accounts.reader);
	const poemReadResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === `/api/v1/poems/${createdPoem.id}`,
	);
	await page.goto(`/poems/${createdPoem.slug}/${createdPoem.id}`);
	expect((await poemReadResponsePromise).status()).toBe(200);
	await expect(page.getByRole('heading', { name: poemTitle })).toBeVisible();
	await expect(page.getByText(poemContent)).toBeVisible();

	const likeResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === `/api/v1/interactions/poems/${createdPoem.id}/like`,
	);
	await page.getByRole('button', { name: 'Like poem' }).click();
	expect((await likeResponsePromise).status()).toBe(201);
	await expect(page.getByRole('button', { name: 'Unlike poem' })).toBeVisible();

	const comment = 'A reader response from the isolated integrated E2E journey.';
	const commentResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === `/api/v1/interactions/poems/${createdPoem.id}/comments`,
	);
	await page.getByPlaceholder('Write a comment (1-3000 characters)').fill(comment);
	await page.getByRole('button', { name: 'Send comment' }).click();
	expect((await commentResponsePromise).status()).toBe(201);
	await expect(page.getByText(comment)).toBeVisible();
	const commentThread = page.locator('[id^="comment-"]').filter({ hasText: comment }).first();
	const likeCommentResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			/\/api\/v1\/interactions\/comments\/\d+\/like$/.test(new URL(response.url()).pathname),
	);
	await commentThread.getByRole('button', { name: 'Like comment' }).click();
	expect((await likeCommentResponsePromise).status()).toBe(201);
	await expect(commentThread.getByRole('button', { name: 'Unlike comment' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	await expect(commentThread.getByLabel('1 like')).toBeVisible();
	await page.reload();
	await expect(page.getByText(comment)).toBeVisible();
	const reloadedCommentThread = page
		.locator('[id^="comment-"]')
		.filter({ hasText: comment })
		.first();
	await expect(
		reloadedCommentThread.getByRole('button', { name: 'Unlike comment' }),
	).toHaveAttribute('aria-pressed', 'true');

	const unlikeCommentResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'DELETE' &&
			/\/api\/v1\/interactions\/comments\/\d+\/like$/.test(new URL(response.url()).pathname),
	);
	await commentThread.getByRole('button', { name: 'Unlike comment' }).click();
	expect((await unlikeCommentResponsePromise).status()).toBe(204);
	await expect(commentThread.getByRole('button', { name: 'Like comment' })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	await expect(commentThread.getByLabel('0 likes')).toBeVisible();

	const reply = 'A disposable reply from the integrated journey.';
	await commentThread.getByRole('button', { name: 'Reply to comment' }).click();
	await commentThread.getByPlaceholder('Reply to comment').fill(reply);
	const replyResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === `/api/v1/interactions/poems/${createdPoem.id}/comments`,
	);
	await commentThread.getByRole('button', { name: 'Send reply' }).click();
	expect((await replyResponsePromise).status()).toBe(201);
	const replyThread = page.locator('[id^="comment-"]').filter({ hasText: reply }).last();
	await expect(replyThread).toBeVisible();
	const likeReplyResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			/\/api\/v1\/interactions\/comments\/\d+\/like$/.test(new URL(response.url()).pathname),
	);
	await replyThread.getByRole('button', { name: 'Like comment' }).click();
	expect((await likeReplyResponsePromise).status()).toBe(201);
	await expect(replyThread.getByRole('button', { name: 'Unlike comment' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	await expect(replyThread.getByLabel('1 like')).toBeVisible();
	await page.reload();
	const reloadedRootThread = page.locator('[id^="comment-"]').filter({ hasText: comment }).first();
	await reloadedRootThread.getByRole('button', { name: 'View replies' }).click();
	const reloadedReplyThread = page.locator('[id^="comment-"]').filter({ hasText: reply }).last();
	await expect(reloadedReplyThread).toBeVisible();
	await expect(reloadedReplyThread.getByRole('button', { name: 'Unlike comment' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	const unlikeReplyResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'DELETE' &&
			/\/api\/v1\/interactions\/comments\/\d+\/like$/.test(new URL(response.url()).pathname),
	);
	await reloadedReplyThread.getByRole('button', { name: 'Unlike comment' }).click();
	expect((await unlikeReplyResponsePromise).status()).toBe(204);
	await expect(reloadedReplyThread.getByRole('button', { name: 'Like comment' })).toHaveAttribute(
		'aria-pressed',
		'false',
	);
	await expect(reloadedReplyThread.getByLabel('0 likes')).toBeVisible();

	await signOut(page);
	await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
	await page.goto('/my-profile');
	await expect(page.getByText('Sign in to view your profile', { exact: true })).toBeVisible();
	const storedAuthClient = await page.evaluate(() => {
		const raw = window.localStorage.getItem('auth-client');
		return raw ? (JSON.parse(raw).authClient ?? null) : null;
	});
	expect(storedAuthClient).toBeNull();
});
