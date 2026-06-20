import type { Page, Request } from '@playwright/test';

import { publicHomePoemsPage } from './fixtures';

export type LoggedOutHomeMock = {
	feedRequests: string[];
	poemRequests: string[];
};

function recordRequest(request: Request, list: string[]) {
	list.push(request.url());
}

function filterPoemsByTitle(searchTitle: string | null) {
	if (!searchTitle) return publicHomePoemsPage.poems;

	const normalizedSearch = searchTitle.toLowerCase();
	return publicHomePoemsPage.poems.filter((poem) =>
		poem.title.toLowerCase().includes(normalizedSearch),
	);
}

export async function mockLoggedOutHome(page: Page): Promise<LoggedOutHomeMock> {
	const feedRequests: string[] = [];
	const poemRequests: string[] = [];

	await page.route('**/api/v1/feed**', async (route) => {
		recordRequest(route.request(), feedRequests);
		await route.fulfill({ status: 200, json: [] });
	});

	await page.route('**/api/v1/poems**', async (route) => {
		const request = route.request();
		recordRequest(request, poemRequests);

		if (request.method() !== 'GET') {
			await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
			return;
		}

		const url = new URL(request.url());
		await route.fulfill({
			status: 200,
			json: {
				...publicHomePoemsPage,
				poems: filterPoemsByTitle(url.searchParams.get('searchTitle')),
			},
		});
	});

	return { feedRequests, poemRequests };
}
