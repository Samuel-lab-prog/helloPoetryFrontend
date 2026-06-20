import { expect, test } from '@playwright/test';

import { clearClientAuth, expectAuthRequiredCard } from '../access-control/helpers';
import { signedInSessionPoem, signedInSessionProfile } from './fixtures';
import { expectLoggedOutNavbar, getPersistedAuthClient, mockExpiredSession } from './helpers';

test.describe('session expiration', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('clears auth and hides cached private profile data when refresh fails after a 401', async ({
		page,
	}) => {
		const sessionMock = await mockExpiredSession(page);

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

		sessionMock.expireSession();
		await page.getByRole('button', { name: 'Edit profile' }).click();
		await page
			.getByRole('textbox', { name: 'Name', exact: true })
			.fill(`${signedInSessionProfile.name} after expiration`);
		await page.getByRole('button', { name: 'Save' }).click();

		await expectAuthRequiredCard(page, {
			eyebrow: 'PROFILE UNAVAILABLE',
			title: 'Sign in to view your profile',
		});
		await expectLoggedOutNavbar(page);
		expect(await getPersistedAuthClient(page)).toBeNull();

		await expect(page.getByText(signedInSessionProfile.name)).not.toBeVisible();
		await expect(page.getByText(signedInSessionProfile.bio)).not.toBeVisible();
		await expect(page.getByText(signedInSessionPoem.title)).not.toBeVisible();

		expect(sessionMock.profileUpdateRequests).toHaveLength(1);
		expect(sessionMock.refreshRequests).toHaveLength(1);
		expect(sessionMock.unexpectedApiRequests).toEqual([]);
	});
});
