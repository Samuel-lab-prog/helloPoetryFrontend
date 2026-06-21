import { expect, test } from '@playwright/test';

import { clearClientAuth } from '../access-control/helpers';
import {
	bannedAuthorRef,
	loggedInFriendAuthor,
	missingAuthorRef,
	privateProfile,
	publicAuthor,
} from './fixtures';
import { mockAuthorErrorPage, mockPublicAuthorPage } from './helpers';

test.describe('logged out author page', () => {
	test('shows the public poet profile without authenticated friendship actions', async ({
		page,
	}) => {
		await clearClientAuth(page);

		const authorMock = await mockPublicAuthorPage(page);
		const publicPoem = publicAuthor.poems[0];

		await page.goto(`/authors/${publicAuthor.id}`);

		await expect(page.getByRole('heading', { name: publicAuthor.name })).toBeVisible();
		await expect(page.getByText(`@${publicAuthor.nickname}`)).toBeVisible();
		await expect(page.getByText(publicAuthor.bio)).toBeVisible();
		await expect(page.getByText('Sign in to send a request.')).toBeVisible();

		await expect(page.getByText(`${publicAuthor.stats.poemsCount} poems`)).toBeVisible();
		await expect(page.getByText(`${publicAuthor.stats.commentsCount} comments`)).toBeVisible();
		await expect(page.getByText(`${publicAuthor.stats.friendsCount} friends`)).toBeVisible();

		await expect(page.getByRole('heading', { name: 'Author poems' })).toBeVisible();
		await expect(page.getByRole('link', { name: new RegExp(publicPoem.title) })).toBeVisible();

		await expect(page.getByRole('button', { name: /send friend request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /cancel request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /accept request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /reject request/i })).not.toBeVisible();

		expect(authorMock.profileRequests.length).toBeGreaterThan(0);
		expect(authorMock.forbiddenFriendMutations).toEqual([]);
	});

	test('shows an unavailable author card without authenticated friendship actions', async ({
		page,
	}) => {
		await clearClientAuth(page);

		const authorMock = await mockAuthorErrorPage(page, missingAuthorRef.id);

		await page.goto(`/authors/${missingAuthorRef.id}`);

		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('AUTHOR UNAVAILABLE');
		await expect(alert).toContainText('We could not load this author right now.');
		await expect(alert.getByRole('button', { name: /refresh author/i })).toBeVisible();

		await expect(page.getByRole('button', { name: /send friend request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /cancel request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /accept request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /reject request/i })).not.toBeVisible();

		expect(authorMock.profileRequests.length).toBeGreaterThan(0);
		expect(authorMock.friendRequests).toEqual([]);
	});

	test('hides a banned author without keeping a previously loaded public profile', async ({
		page,
	}) => {
		await clearClientAuth(page);

		await mockPublicAuthorPage(page);
		const authorMock = await mockAuthorErrorPage(page, bannedAuthorRef.id);
		const publicPoem = publicAuthor.poems[0];

		await page.goto(`/authors/${publicAuthor.id}`);
		await expect(page.getByRole('heading', { name: publicAuthor.name })).toBeVisible();
		await expect(page.getByRole('link', { name: new RegExp(publicPoem.title) })).toBeVisible();

		await page.goto(`/authors/${bannedAuthorRef.id}`);

		const alert = page.getByRole('alert').first();
		await expect(alert).toBeVisible();
		await expect(alert).toContainText('AUTHOR UNAVAILABLE');
		await expect(alert).toContainText('We could not load this author right now.');
		await expect(alert).not.toContainText(/banned/i);

		await expect(page.getByRole('heading', { name: publicAuthor.name })).not.toBeVisible();
		await expect(page.getByText(publicAuthor.bio)).not.toBeVisible();
		await expect(page.getByRole('link', { name: new RegExp(publicPoem.title) })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /send friend request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /cancel request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /accept request/i })).not.toBeVisible();
		await expect(page.getByRole('button', { name: /reject request/i })).not.toBeVisible();

		expect(authorMock.profileRequests.length).toBeGreaterThan(0);
		expect(authorMock.friendRequests).toEqual([]);
	});

	test('does not keep logged-in friendship state after signing out', async ({ page }) => {
		await page.goto('/login');
		await page.evaluate((profile) => {
			window.localStorage.setItem(
				'auth-client',
				JSON.stringify({
					authClient: {
						id: profile.id,
						role: profile.role,
						status: profile.status,
					},
					unreadNotificationsCount: 0,
				}),
			);
		}, privateProfile);

		const authorMock = await mockPublicAuthorPage(page, loggedInFriendAuthor);

		await page.goto(`/authors/${publicAuthor.id}`);
		await expect(page.getByText('You are friends.')).toBeVisible();

		await page.goto('/my-profile');
		await page.getByRole('button', { name: /sign out/i }).click();
		await expect(page).toHaveURL(/\/login$/);
		await page.waitForFunction(() => {
			const raw = window.localStorage.getItem('auth-client');
			if (!raw) return true;
			return JSON.parse(raw).authClient === null;
		});

		authorMock.setAuthorProfile(publicAuthor);
		await page.evaluate((authorId) => {
			window.history.pushState({}, '', `/authors/${authorId}`);
			window.dispatchEvent(new PopStateEvent('popstate'));
		}, publicAuthor.id);

		await expect(page.getByText('Sign in to send a request.')).toBeVisible();
		await expect(page.getByText('You are friends.')).not.toBeVisible();
		expect(authorMock.profileRequests.length).toBeGreaterThanOrEqual(2);
		expect(authorMock.forbiddenFriendMutations).toEqual([]);
	});
});
