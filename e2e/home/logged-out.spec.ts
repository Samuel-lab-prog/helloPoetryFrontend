import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { publicHomePoem } from './fixtures';
import { mockLoggedOutHome } from './helpers';

test.describe('logged out home feed', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('loads public recent poems without requesting the personalized feed', async ({ page }) => {
		const homeMock = await mockLoggedOutHome(page);

		await page.goto('/');

		await expect(page.getByPlaceholder('Search by title')).toBeVisible();
		await expect(page.getByText(publicHomePoem.title)).toBeVisible();
		await expect(page.getByText(publicHomePoem.excerpt)).toBeVisible();
		await expect(page.getByText(`@${publicHomePoem.author.nickname}`)).toBeVisible();

		expect(homeMock.poemRequests.length).toBeGreaterThan(0);
		expect(homeMock.feedRequests).toEqual([]);

		const firstPoemsRequest = new URL(homeMock.poemRequests[0]);
		expect(firstPoemsRequest.searchParams.get('limit')).toBe('4');
		expect(firstPoemsRequest.searchParams.get('orderBy')).toBe('createdAt');
		expect(firstPoemsRequest.searchParams.get('orderDirection')).toBe('desc');
	});
});
