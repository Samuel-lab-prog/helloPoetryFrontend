import { expect, type Page, test } from '@playwright/test';

import { getPersistedAuthClient, mockBannedSession, seedPersistedAuthClient } from './helpers';

const bannedAuthorClient = {
	id: 901,
	role: 'author',
	status: 'banned',
} as const;

const bannedModeratorClient = {
	id: 902,
	role: 'moderator',
	status: 'banned',
} as const;

async function expectNoBannedPrivateShortcuts(page: Page) {
	await expect(page.locator('a[href="/my-profile"]').first()).toBeVisible();
	await expect(page.locator('a[href="/poems/new"]')).toHaveCount(0);
	await expect(page.locator('a[href="/notifications"]')).toHaveCount(0);
	await expect(page.locator('a[href="/admin/moderation"]')).toHaveCount(0);
	await expect(page.locator('a[href="/login"]')).toHaveCount(0);
	await expect(page.locator('a[href="/register"]')).toHaveCount(0);
}

test.describe('banned session access control', () => {
	test('keeps auth state and shows clear blocked states for a banned author', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await seedPersistedAuthClient(page, bannedAuthorClient);
		const sessionMock = await mockBannedSession(page);

		await page.goto('/');

		await expectNoBannedPrivateShortcuts(page);
		await expect(page.getByText('The feed is unavailable for this account')).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't view poems."),
		).toBeVisible();
		expect(await getPersistedAuthClient(page)).toEqual(bannedAuthorClient);

		await page.goto('/poems/new');
		await expect(page.getByText('Create poem unavailable')).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't create poems."),
		).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Create Poem' })).not.toBeVisible();

		await page.goto('/notifications');
		await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
		await expect(page.getByText('Notifications are unavailable for this account')).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't read notifications."),
		).toBeVisible();
		await expect(page.getByText("You're all caught up")).not.toBeVisible();

		await page.goto('/my-profile/friend-requests');
		await expect(page.getByRole('heading', { name: 'All my requests' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Friend requests received' })).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't view friend requests."),
		).toBeVisible();
		await expect(page.getByText('No pending requests.')).not.toBeVisible();

		await page.goto('/my-profile');
		await expect(page.getByText('Profile access is unavailable for this account')).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't view profiles."),
		).toBeVisible();

		expect(await getPersistedAuthClient(page)).toEqual(bannedAuthorClient);
		expect(sessionMock.bannedRequests.length).toBeGreaterThan(0);
		expect(sessionMock.refreshRequests.length).toBeGreaterThan(0);
	});

	test('blocks moderation tools for a banned moderator', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await seedPersistedAuthClient(page, bannedModeratorClient);
		const sessionMock = await mockBannedSession(page);

		await page.goto('/admin/moderation');

		await expectNoBannedPrivateShortcuts(page);
		await expect(page.getByText('Moderation unavailable', { exact: true })).toBeVisible();
		await expect(
			page.getByText("This account has been banned, so you can't use moderation tools."),
		).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Moderation' })).not.toBeVisible();

		expect(await getPersistedAuthClient(page)).toEqual(bannedModeratorClient);
		expect(
			sessionMock.bannedRequests.every((request) => !request.url.includes('/moderation')),
		).toBe(true);
		expect(sessionMock.refreshRequests.length).toBeGreaterThan(0);
	});
});
