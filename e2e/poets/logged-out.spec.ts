import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import { publicPoetsPage } from './fixtures';
import { mockLoggedOutPoetsSearch } from './helpers';

test.describe('logged out poets search', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('loads public poets without authenticated user or friendship requests', async ({ page }) => {
		const poetsMock = await mockLoggedOutPoetsSearch(page);
		const firstPoet = publicPoetsPage.users[0];
		const secondPoet = publicPoetsPage.users[1];

		await page.goto('/poets');

		await expect(page.getByPlaceholder('Search by nickname')).toBeVisible();
		await expect(page.getByText(firstPoet.name)).toBeVisible();
		await expect(page.getByText(`@${firstPoet.nickname}`)).toBeVisible();
		await expect(page.getByText(secondPoet.name)).toBeVisible();
		await expect(page.getByText(`@${secondPoet.nickname}`)).toBeVisible();

		await expect(page.getByRole('link', { name: new RegExp(firstPoet.name) })).toHaveAttribute(
			'href',
			`/authors/${firstPoet.id}`,
		);
		await expect(
			page.getByRole('button', { name: /open user moderation actions/i }),
		).not.toBeVisible();

		expect(poetsMock.publicUserRequests.length).toBeGreaterThan(0);
		expect(poetsMock.privateUserRequests).toEqual([]);
		expect(poetsMock.friendRequests).toEqual([]);

		const firstPublicUsersRequest = new URL(poetsMock.publicUserRequests[0]);
		expect(firstPublicUsersRequest.searchParams.get('limit')).toBe('10');
		expect(firstPublicUsersRequest.searchParams.get('searchNickname')).toBeNull();
	});

	test('searches by nickname through the public endpoint only', async ({ page }) => {
		const poetsMock = await mockLoggedOutPoetsSearch(page);
		const firstPoet = publicPoetsPage.users[0];
		const secondPoet = publicPoetsPage.users[1];

		await page.goto('/poets');
		await page.getByPlaceholder('Search by nickname').fill('two');

		await expect
			.poll(() =>
				poetsMock.publicUserRequests.some((requestUrl) => {
					const url = new URL(requestUrl);
					return url.searchParams.get('searchNickname') === 'two';
				}),
			)
			.toBe(true);
		await expect(page.getByText(secondPoet.name)).toBeVisible();
		await expect(page.getByText(`@${secondPoet.nickname}`)).toBeVisible();
		await expect(page.getByText(firstPoet.name)).not.toBeVisible();

		expect(poetsMock.privateUserRequests).toEqual([]);
		expect(poetsMock.friendRequests).toEqual([]);
	});
});
