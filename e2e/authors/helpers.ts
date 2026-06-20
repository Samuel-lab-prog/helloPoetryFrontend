import type { Page, Request } from '@playwright/test';

import { privateProfile, publicAuthor } from './fixtures';

type AuthorProfileFixture = typeof publicAuthor;

type ForbiddenFriendMutation = {
	method: string;
	url: string;
};

export type AuthorPageMock = {
	forbiddenFriendMutations: ForbiddenFriendMutation[];
	profileRequests: string[];
	setAuthorProfile: (profile: AuthorProfileFixture) => void;
};

export type AuthorErrorPageMock = {
	friendRequests: string[];
	profileRequests: string[];
};

function isUnsafeMethod(method: string) {
	return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

async function recordForbiddenFriendMutation(
	request: Request,
	forbiddenFriendMutations: ForbiddenFriendMutation[],
) {
	forbiddenFriendMutations.push({
		method: request.method(),
		url: request.url(),
	});
}

export async function mockPublicAuthorPage(
	page: Page,
	initialProfile: AuthorProfileFixture = publicAuthor,
): Promise<AuthorPageMock> {
	let authorProfile = initialProfile;
	const forbiddenFriendMutations: ForbiddenFriendMutation[] = [];
	const profileRequests: string[] = [];

	await page.route(`**/api/v1/users/${publicAuthor.id}/profile`, async (route) => {
		const request = route.request();
		profileRequests.push(request.url());

		await route.fulfill({ status: 200, json: authorProfile });
	});

	await page.route(`**/api/v1/users/${privateProfile.id}/profile`, async (route) => {
		await route.fulfill({ status: 200, json: privateProfile });
	});

	await page.route('**/api/v1/friends/**', async (route) => {
		const request = route.request();
		if (isUnsafeMethod(request.method())) {
			await recordForbiddenFriendMutation(request, forbiddenFriendMutations);
			await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
			return;
		}

		await route.fulfill({ status: 200, json: { sent: [], received: [] } });
	});

	await page.route('**/api/v1/poems/me', async (route) => {
		await route.fulfill({ status: 200, json: [] });
	});

	await page.route('**/api/v1/poems/saved', async (route) => {
		await route.fulfill({ status: 200, json: [] });
	});

	await page.route('**/api/v1/poems/collections', async (route) => {
		await route.fulfill({ status: 200, json: [] });
	});

	return {
		forbiddenFriendMutations,
		profileRequests,
		setAuthorProfile: (profile) => {
			authorProfile = profile;
		},
	};
}

export async function mockAuthorErrorPage(
	page: Page,
	authorId: number,
): Promise<AuthorErrorPageMock> {
	const friendRequests: string[] = [];
	const profileRequests: string[] = [];

	await page.route(`**/api/v1/users/${authorId}/profile`, async (route) => {
		profileRequests.push(route.request().url());
		await route.fulfill({
			status: 404,
			json: {
				code: 'NOT_FOUND',
				message: 'Author not found.',
			},
		});
	});

	await page.route('**/api/v1/friends/**', async (route) => {
		friendRequests.push(route.request().url());
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	return {
		friendRequests,
		profileRequests,
	};
}
