import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { publicHomePoem, publicHomeSearchPoem } from './fixtures';
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

	test('searches by title through public poems without requesting the personalized feed', async ({
		page,
	}) => {
		const homeMock = await mockLoggedOutHome(page);

		await page.goto('/');
		await page.getByPlaceholder('Search by title').fill('searched');

		await expect
			.poll(() =>
				homeMock.poemRequests.some((requestUrl) => {
					const url = new URL(requestUrl);
					return url.searchParams.get('searchTitle') === 'searched';
				}),
			)
			.toBe(true);

		await expect(page.getByText(publicHomeSearchPoem.title)).toBeVisible();
		await expect(page.getByText(publicHomeSearchPoem.excerpt)).toBeVisible();
		await expect(page.getByText(publicHomePoem.title)).not.toBeVisible();

		const searchRequest = homeMock.poemRequests
			.map((requestUrl) => new URL(requestUrl))
			.find((url) => url.searchParams.get('searchTitle') === 'searched');

		expect(searchRequest?.searchParams.get('limit')).toBe('8');
		expect(searchRequest?.searchParams.get('orderBy')).toBe('createdAt');
		expect(searchRequest?.searchParams.get('orderDirection')).toBe('desc');
		expect(homeMock.feedRequests).toEqual([]);
	});
});
