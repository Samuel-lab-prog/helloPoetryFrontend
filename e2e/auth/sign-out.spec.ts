import { expect, test } from '@playwright/test';

import { clearClientAuth, expectAuthRequiredCard } from '../access-control/helpers';
import { signedInSessionPoem, signedInSessionProfile } from './fixtures';
import { expectLoggedOutNavbar, getPersistedAuthClient, mockSignOutSession } from './helpers';

test.describe('sign out transition', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('returns to logged-out navigation and hides private cached data without a reload', async ({
		page,
	}) => {
		const sessionMock = await mockSignOutSession(page);

		await page.goto('/login');
		await page.getByLabel('Email').fill(signedInSessionProfile.email);
		await page.getByLabel('Password').fill('password123');
		await page.getByRole('button', { name: 'Sign in' }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect.poll(() => sessionMock.loginRequests.length).toBe(1);

		const myProfileLink = page.locator('a[href="/my-profile"]').first();
		await expect(myProfileLink).toBeVisible();
		await myProfileLink.click();

		await expect(page.getByRole('heading', { name: 'My Profile' })).toBeVisible();
		await expect(page.getByText(signedInSessionProfile.name)).toBeVisible();
		await expect(page.getByText(`@${signedInSessionProfile.nickname}`)).toBeVisible();
		await expect(page.getByText(signedInSessionProfile.bio)).toBeVisible();
		await expect(page.getByText(signedInSessionPoem.title)).toBeVisible();
		await expect(page.locator('a[href="/my-profile"]').first()).toBeVisible();

		await page.getByRole('button', { name: /sign out/i }).click();

		await expect(page).toHaveURL(/\/login$/);
		await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
		await expectLoggedOutNavbar(page);
		expect(await getPersistedAuthClient(page)).toBeNull();

		await expect(page.getByText(signedInSessionProfile.name)).not.toBeVisible();
		await expect(page.getByText(signedInSessionPoem.title)).not.toBeVisible();

		const privateRequestCountAfterLogout = sessionMock.privateRequests.length;

		await page.evaluate(() => {
			window.history.pushState({}, '', '/my-profile');
			window.dispatchEvent(new PopStateEvent('popstate'));
		});

		await expectAuthRequiredCard(page, {
			eyebrow: 'PROFILE UNAVAILABLE',
			title: 'Sign in to view your profile',
		});
		await expect(page.getByText(signedInSessionProfile.name)).not.toBeVisible();
		await expect(page.getByText(signedInSessionPoem.title)).not.toBeVisible();

		expect(sessionMock.privateRequests.length).toBe(privateRequestCountAfterLogout);
		expect(sessionMock.unexpectedApiRequests).toEqual([]);
	});
});
