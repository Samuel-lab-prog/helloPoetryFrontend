import type { Page, Request } from '@playwright/test';

import { publicPoem, publicPoemCommentsPage, publicPoemRepliesPage } from './fixtures';

type ForbiddenMutation = {
	method: string;
	url: string;
};

export type PoemPageMock = {
	commentRequests: string[];
	forbiddenMutations: ForbiddenMutation[];
};

type PoemErrorStatus = 403 | 404;

type MockPoemErrorPageOptions = {
	code?: string;
	message?: string;
	poemId: number;
	status: PoemErrorStatus;
};

export type PoemErrorPageMock = {
	interactionRequests: string[];
	poemRequests: string[];
};

function isUnsafeMethod(method: string) {
	return method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
}

async function recordForbiddenMutation(request: Request, forbiddenMutations: ForbiddenMutation[]) {
	forbiddenMutations.push({
		method: request.method(),
		url: request.url(),
	});
}

export async function mockPublicPoemPage(page: Page): Promise<PoemPageMock> {
	const commentRequests: string[] = [];
	const forbiddenMutations: ForbiddenMutation[] = [];

	await page.route(`**/api/v1/poems/${publicPoem.id}`, async (route) => {
		const request = route.request();
		if (request.method() !== 'GET') {
			await recordForbiddenMutation(request, forbiddenMutations);
			await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
			return;
		}

		await route.fulfill({ status: 200, json: publicPoem });
	});

	await page.route(`**/api/v1/interactions/poems/${publicPoem.id}/comments**`, async (route) => {
		const request = route.request();
		if (isUnsafeMethod(request.method())) {
			await recordForbiddenMutation(request, forbiddenMutations);
			await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
			return;
		}

		commentRequests.push(request.url());
		const url = new URL(request.url());
		const parentId = url.searchParams.get('parentId');
		await route.fulfill({
			status: 200,
			json: parentId === '201' ? publicPoemRepliesPage : publicPoemCommentsPage,
		});
	});

	await page.route(`**/api/v1/interactions/poems/${publicPoem.id}/like`, async (route) => {
		const request = route.request();
		await recordForbiddenMutation(request, forbiddenMutations);
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	await page.route('**/api/v1/interactions/comments/**', async (route) => {
		const request = route.request();
		if (!isUnsafeMethod(request.method())) {
			await route.fulfill({ status: 200, json: publicPoemRepliesPage });
			return;
		}

		await recordForbiddenMutation(request, forbiddenMutations);
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	await page.route(`**/api/v1/poems/${publicPoem.id}/save`, async (route) => {
		const request = route.request();
		await recordForbiddenMutation(request, forbiddenMutations);
		await route.fulfill({ status: 403, json: { message: 'Forbidden in test' } });
	});

	return { commentRequests, forbiddenMutations };
}

export async function mockPoemErrorPage(
	page: Page,
	{ code, message, poemId, status }: MockPoemErrorPageOptions,
): Promise<PoemErrorPageMock> {
	const interactionRequests: string[] = [];
	const poemRequests: string[] = [];
	const responseMessage =
		message ?? (status === 404 ? 'Poem not found.' : 'Access denied to this poem.');
	const responseCode = code ?? (status === 404 ? 'NOT_FOUND' : 'FORBIDDEN');

	await page.route(`**/api/v1/poems/${poemId}`, async (route) => {
		const request = route.request();
		poemRequests.push(request.url());
		await route.fulfill({
			status,
			json: {
				code: responseCode,
				message: responseMessage,
			},
		});
	});

	await page.route(`**/api/v1/poems/${poemId}/save`, async (route) => {
		interactionRequests.push(route.request().url());
		await route.fulfill({ status: 403, json: { code: 'FORBIDDEN', message: 'Forbidden in test' } });
	});

	await page.route(`**/api/v1/interactions/poems/${poemId}/**`, async (route) => {
		interactionRequests.push(route.request().url());
		await route.fulfill({ status: 403, json: { code: 'FORBIDDEN', message: 'Forbidden in test' } });
	});

	return { interactionRequests, poemRequests };
}
