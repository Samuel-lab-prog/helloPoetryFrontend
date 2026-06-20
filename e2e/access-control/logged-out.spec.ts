import { expect, test } from '@playwright/test';

import {
	clearClientAuth,
	expectLoggedOutProtectedRoute,
	type ProtectedRouteExpectation,
} from './helpers';

const profileGate = {
	eyebrow: 'PROFILE UNAVAILABLE',
	title: 'Sign in to view your profile',
};
const createPoemRoute = {
	path: '/poems/new',
	eyebrow: 'POEMS UNAVAILABLE',
	title: 'Sign in to create a poem',
};
const adminRoute = {
	path: '/admin',
	eyebrow: 'POEM TOOLS UNAVAILABLE',
	title: 'Sign in to use poem tools',
};
const notificationsRoute = {
	path: '/notifications',
	eyebrow: 'NOTIFICATIONS UNAVAILABLE',
	title: 'Sign in to view notifications',
};
const moderationRoute = {
	path: '/admin/moderation',
	eyebrow: 'MODERATION UNAVAILABLE',
	title: 'Sign in to access moderation',
};

const protectedRoutes: ProtectedRouteExpectation[] = [
	'/my-profile',
	'/my-profile/poems',
	'/my-profile/friend-requests',
	'/my-profile/collections',
	'/my-profile/saved-poems',
].map((path) => ({ path, ...profileGate }));

protectedRoutes.push(createPoemRoute, adminRoute, notificationsRoute, moderationRoute);

test.describe('logged out access control', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	for (const route of protectedRoutes) {
		test(`${route.path} shows the shared auth required card`, async ({ page }) => {
			await expectLoggedOutProtectedRoute(page, route);
		});
	}

	test('/admin does not expose poem tools while logged out', async ({ page }) => {
		await expectLoggedOutProtectedRoute(page, adminRoute);

		await expect(page.getByRole('heading', { name: 'Admin Panel' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /select admin action/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /^create poem$/i })).not.toBeVisible();
		await expect(page.getByText(/^update poem$/i)).not.toBeVisible();
		await expect(page.getByText(/^delete poem$/i)).not.toBeVisible();
	});

	test('/notifications does not render the notifications shell while logged out', async ({
		page,
	}) => {
		await expectLoggedOutProtectedRoute(page, notificationsRoute);

		await expect(page.getByRole('heading', { name: 'Notifications' })).not.toBeVisible();
		await expect(
			page.getByRole('button', { name: /open notification actions/i }),
		).not.toBeVisible();
		await expect(page.getByText("You're all caught up")).not.toBeVisible();
	});
});
