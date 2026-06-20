import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { missingPoemRef, publicPoem, publicPoemCommentsPage, restrictedPoemRef } from './fixtures';
import { mockPoemErrorPage, mockPublicPoemPage } from './helpers';

const publicPoemRoutes = [
	{ label: 'id route', path: `/poems/${publicPoem.id}` },
	{ label: 'slug route', path: `/poems/${publicPoem.slug}/${publicPoem.id}` },
];

async function expectPublicPoemReadOnly(page: Parameters<typeof mockPublicPoemPage>[0]) {
	await expect(page.getByRole('heading', { name: publicPoem.title })).toBeVisible();
	await expect(page.getByText(publicPoem.content)).toBeVisible();
	await expect(page.getByRole('link', { name: `@${publicPoem.author.nickname}` })).toBeVisible();

	await expect(page.getByRole('button', { name: /like poem/i })).not.toBeVisible();
	await expect(page.getByRole('button', { name: /save poem/i })).not.toBeVisible();
	await expect(page.getByRole('button', { name: /delete comment/i })).not.toBeVisible();

	const commentInput = page.getByPlaceholder('Write a comment (1-3000 characters)');
	await expect(commentInput).toBeVisible();
	await expect(commentInput).toBeDisabled();
	await expect(page.getByRole('button', { name: /send comment/i })).toBeDisabled();
	await expect(page.getByText('Sign in to comment.')).toBeVisible();

	await expect(page.getByText(publicPoemCommentsPage.comments[0].content)).not.toBeVisible();
	await expect(page.getByText('Sign in to see the comments.')).toBeVisible();
}

test.describe('logged out poem interactions', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	for (const route of publicPoemRoutes) {
		test(`allows reading a public poem through the ${route.label} but blocks authenticated actions`, async ({
			page,
		}) => {
			const poemMock = await mockPublicPoemPage(page);

			await page.goto(route.path);
			await expectPublicPoemReadOnly(page);

			expect(poemMock.commentRequests).toEqual([]);
			expect(poemMock.forbiddenMutations).toEqual([]);
		});
	}

	test('shows an unavailable card without keeping the previously loaded poem', async ({ page }) => {
		await mockPublicPoemPage(page);
		const errorMock = await mockPoemErrorPage(page, {
			poemId: restrictedPoemRef.id,
			status: 403,
		});

		await page.goto(`/poems/${publicPoem.slug}/${publicPoem.id}`);
		await expect(page.getByRole('heading', { name: publicPoem.title })).toBeVisible();
		await expect(page.getByText(publicPoem.content)).toBeVisible();

		await page.goto(`/poems/${restrictedPoemRef.slug}/${restrictedPoemRef.id}`);

		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('POEM UNAVAILABLE');
		await expect(alert).toContainText('You do not have permission to view this poem.');
		await expect(alert).toContainText(
			'This poem may be private, under moderation, or no longer available to your account.',
		);
		await expect(alert.getByRole('button', { name: /refresh poem/i })).toBeVisible();

		await expect(page.getByRole('heading', { name: publicPoem.title })).not.toBeVisible();
		await expect(page.getByText(publicPoem.content)).not.toBeVisible();
		await expect(page.getByRole('button', { name: /like poem/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /save poem/i })).not.toBeVisible();
		await expect(page.getByPlaceholder('Write a comment (1-3000 characters)')).not.toBeVisible();

		expect(errorMock.poemRequests.length).toBeGreaterThan(0);
		expect(errorMock.interactionRequests).toEqual([]);
	});

	test('shows a not found card for poems that no longer exist', async ({ page }) => {
		const errorMock = await mockPoemErrorPage(page, {
			poemId: missingPoemRef.id,
			status: 404,
		});

		await page.goto(`/poems/${missingPoemRef.slug}/${missingPoemRef.id}`);

		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('POEM NOT FOUND');
		await expect(alert).toContainText('This poem could not be found.');
		await expect(alert).toContainText('It may have been deleted or the link may be invalid.');
		await expect(alert.getByRole('button', { name: /refresh poem/i })).toBeVisible();

		await expect(page.getByRole('button', { name: /like poem/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /save poem/i })).not.toBeVisible();
		await expect(page.getByPlaceholder('Write a comment (1-3000 characters)')).not.toBeVisible();

		expect(errorMock.poemRequests.length).toBeGreaterThan(0);
		expect(errorMock.interactionRequests).toEqual([]);
	});

	test('does not request the API when the poem id is invalid', async ({ page }) => {
		const poemRequests: string[] = [];

		await page.route('**/api/v1/poems/**', async (route) => {
			poemRequests.push(route.request().url());
			await route.fulfill({
				status: 500,
				json: { code: 'UNEXPECTED_TEST_REQUEST', message: 'Unexpected poem request' },
			});
		});

		await page.goto('/poems/not-a-number');

		await expect(page.getByText('Invalid poem ID.')).toBeVisible();
		expect(poemRequests).toEqual([]);
	});
});
