import { expect, test } from '@playwright/test';

import { clearClientAuth, expectAuthRequiredCard } from './helpers';

const protectedRoutes = [
	{
		path: '/my-profile',
		eyebrow: 'PROFILE UNAVAILABLE',
		title: 'Sign in to view your profile',
	},
	{
		path: '/my-profile/poems',
		eyebrow: 'PROFILE UNAVAILABLE',
		title: 'Sign in to view your profile',
	},
	{
		path: '/my-profile/friend-requests',
		eyebrow: 'PROFILE UNAVAILABLE',
		title: 'Sign in to view your profile',
	},
	{
		path: '/my-profile/collections',
		eyebrow: 'PROFILE UNAVAILABLE',
		title: 'Sign in to view your profile',
	},
	{
		path: '/my-profile/saved-poems',
		eyebrow: 'PROFILE UNAVAILABLE',
		title: 'Sign in to view your profile',
	},
	{
		path: '/poems/new',
		eyebrow: 'POEMS UNAVAILABLE',
		title: 'Sign in to create a poem',
	},
	{
		path: '/admin',
		eyebrow: 'POEM TOOLS UNAVAILABLE',
		title: 'Sign in to use poem tools',
	},
	{
		path: '/notifications',
		eyebrow: 'NOTIFICATIONS UNAVAILABLE',
		title: 'Sign in to view notifications',
	},
	{
		path: '/admin/moderation',
		eyebrow: 'MODERATION UNAVAILABLE',
		title: 'Sign in to access moderation',
	},
];

test.describe('logged out access control', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	for (const route of protectedRoutes) {
		test(`${route.path} shows the shared auth required card`, async ({ page }) => {
			await page.goto(route.path);

			await expectAuthRequiredCard(page, route);
		});
	}

	test('/admin does not expose poem tools while logged out', async ({ page }) => {
		await page.goto('/admin');

		await expectAuthRequiredCard(page, {
			eyebrow: 'POEM TOOLS UNAVAILABLE',
			title: 'Sign in to use poem tools',
		});
		await expect(page.getByRole('heading', { name: 'Admin Panel' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /select admin action/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /^create poem$/i })).not.toBeVisible();
		await expect(page.getByText(/^update poem$/i)).not.toBeVisible();
		await expect(page.getByText(/^delete poem$/i)).not.toBeVisible();
	});

	test('/notifications does not render the notifications shell while logged out', async ({
		page,
	}) => {
		await page.goto('/notifications');

		await expectAuthRequiredCard(page, {
			eyebrow: 'NOTIFICATIONS UNAVAILABLE',
			title: 'Sign in to view notifications',
		});
		await expect(page.getByRole('heading', { name: 'Notifications' })).not.toBeVisible();
		await expect(
			page.getByRole('button', { name: /open notification actions/i }),
		).not.toBeVisible();
		await expect(page.getByText("You're all caught up")).not.toBeVisible();
	});
});
