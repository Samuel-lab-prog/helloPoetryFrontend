import { expect, type Page } from '@playwright/test';

export type AuthRequiredCardExpectation = {
	description?: string | RegExp;
	eyebrow: string | RegExp;
	title: string | RegExp;
};

export type ProtectedRouteExpectation = AuthRequiredCardExpectation & {
	path: string;
};

type ApiRequest = {
	method: string;
	url: string;
};

export async function clearClientAuth(page: Page) {
	await page.context().clearCookies();
	await page.addInitScript(() => {
		window.localStorage.clear();
		window.sessionStorage.clear();
	});
}

async function trackUnexpectedApiRequests(page: Page): Promise<ApiRequest[]> {
	const apiRequests: ApiRequest[] = [];

	await page.route('**/api/v1/**', async (route) => {
		const request = route.request();
		apiRequests.push({
			method: request.method(),
			url: request.url(),
		});
		await route.fulfill({
			status: 500,
			json: {
				code: 'UNEXPECTED_TEST_REQUEST',
				message: 'Logged-out protected routes should not request the API.',
			},
		});
	});

	return apiRequests;
}

export async function expectAuthRequiredCard(
	page: Page,
	{ description, eyebrow, title }: AuthRequiredCardExpectation,
) {
	const card = page.getByRole('alert').first();

	await expect(card).toBeVisible();
	await expect(card).toContainText(eyebrow);
	await expect(card).toContainText(title);
	if (description) await expect(card).toContainText(description);
	await expect(card.getByRole('link', { name: /sign in/i })).toBeVisible();
	await expect(card.getByRole('link', { name: /create account/i })).toBeVisible();
}

export async function expectLoggedOutProtectedRoute(page: Page, route: ProtectedRouteExpectation) {
	const apiRequests = await trackUnexpectedApiRequests(page);

	await page.goto(route.path);
	await expectAuthRequiredCard(page, route);
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			}),
	);

	expect(apiRequests, `${route.path} should render its auth gate without calling the API`).toEqual(
		[],
	);
}
