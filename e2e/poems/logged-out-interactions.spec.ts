import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { publicPoem, publicPoemCommentsPage } from './fixtures';
import { mockPublicPoemPage } from './helpers';

test.describe('logged out poem interactions', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('allows reading a public poem but blocks authenticated actions', async ({ page }) => {
		const poemMock = await mockPublicPoemPage(page);

		await page.goto(`/poems/${publicPoem.slug}/${publicPoem.id}`);

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

		expect(poemMock.commentRequests).toEqual([]);
		expect(poemMock.forbiddenMutations).toEqual([]);
	});
});
