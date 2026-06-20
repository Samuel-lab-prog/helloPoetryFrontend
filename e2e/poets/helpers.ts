import type { Page, Request } from '@playwright/test';

import { publicPoetsPage } from './fixtures';

export type PoetsSearchMock = {
	friendRequests: string[];
	privateUserRequests: string[];
	publicUserRequests: string[];
};

function recordRequest(request: Request, list: string[]) {
	list.push(request.url());
}

function filterPoets(searchNickname: string | null) {
	if (!searchNickname) return publicPoetsPage.users;

	const normalizedSearch = searchNickname.toLowerCase();
	return publicPoetsPage.users.filter((poet) =>
		poet.nickname.toLowerCase().includes(normalizedSearch),
	);
}

export async function mockLoggedOutPoetsSearch(page: Page): Promise<PoetsSearchMock> {
	const friendRequests: string[] = [];
	const privateUserRequests: string[] = [];
	const publicUserRequests: string[] = [];

	await page.route('**/api/v1/users**', async (route) => {
		const request = route.request();
		const url = new URL(request.url());

		if (url.pathname.endsWith('/api/v1/users/public') && request.method() === 'GET') {
			recordRequest(request, publicUserRequests);
			await route.fulfill({
				status: 200,
				json: {
					...publicPoetsPage,
					users: filterPoets(url.searchParams.get('searchNickname')),
				},
			});
			return;
		}

		recordRequest(request, privateUserRequests);
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	await page.route('**/api/v1/friends/**', async (route) => {
		recordRequest(route.request(), friendRequests);
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	return {
		friendRequests,
		privateUserRequests,
		publicUserRequests,
	};
}
