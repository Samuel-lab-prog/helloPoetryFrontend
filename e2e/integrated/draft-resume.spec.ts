import { expect, type Page, test } from '@playwright/test';

const author = {
	email: 'e2e-author@hello-poetry.test',
	password: 'HelloPoetry-E2E-Only-2026',
};
const reader = {
	email: 'e2e-reader@hello-poetry.test',
	password: 'HelloPoetry-E2E-Only-2026',
};

async function signIn(page: Page, account: { email: string; password: string }) {
	await page.goto('/login');
	await page.getByLabel('Email').fill(account.email);
	await page.getByLabel('Password').fill(account.password);
	const loginResponse = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/auth/login',
	);
	await page.getByRole('button', { name: 'Sign in' }).click();
	expect((await loginResponse).status()).toBe(200);
}

async function signOut(page: Page) {
	await page.goto('/my-profile');
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/login$/);
}

test('author finds, resumes, edits, and reloads a draft', async ({ page }) => {
	await signIn(page, author);

	const initialTitle = `E2E Draft ${Date.now()}`;
	const updatedTitle = `${initialTitle} revised`;
	await page.goto('/poems/new');
	await page.getByLabel('Title').fill(initialTitle);
	await page.getByLabel('Summary').fill('A draft summary for the integrated resume journey.');
	await page
		.getByLabel('Content (Markdown)')
		.fill('A draft poem with enough words to satisfy validation.');
	await page.getByLabel('Visibility').selectOption('private');

	const createResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'POST' &&
			new URL(response.url()).pathname === '/api/v1/poems',
	);
	await page.getByRole('button', { name: 'Create Poem' }).click();
	const createResponse = await createResponsePromise;
	expect(createResponse.status()).toBe(201);
	const createdPoem = (await createResponse.json()) as { id: number; status: string };
	expect(createdPoem.status).toBe('draft');

	await page.goto('/my-profile/poems?status=draft');
	await expect(page.getByRole('combobox', { name: 'Filter poems by status' })).toHaveValue('draft');
	const resumeButton = page.getByRole('button', { name: `Continue writing ${initialTitle}` });
	await expect(resumeButton).toBeVisible();
	await resumeButton.click();
	await expect(page).toHaveURL(`/admin?mode=update&poemId=${createdPoem.id}`);
	await expect(page.getByLabel('Title')).toHaveValue(initialTitle);

	await page.getByLabel('Title').fill(updatedTitle);
	const updateResponsePromise = page.waitForResponse(
		(response) =>
			response.request().method() === 'PUT' &&
			new URL(response.url()).pathname === `/api/v1/poems/${createdPoem.id}`,
	);
	await page.getByRole('button', { name: 'Update Poem' }).click();
	expect((await updateResponsePromise).ok()).toBeTruthy();

	await page.reload();
	await expect(page.getByLabel('Title')).toHaveValue(updatedTitle);

	let promptedAfterSave = false;
	const savedNavigationDialog = (dialog: { dismiss: () => Promise<void> }) => {
		promptedAfterSave = true;
		void dialog.dismiss();
	};
	page.on('dialog', savedNavigationDialog);
	await page.getByRole('link', { name: 'Home' }).first().click();
	await expect(page).toHaveURL('/');
	page.off('dialog', savedNavigationDialog);
	expect(promptedAfterSave).toBe(false);

	await page.goto(`/admin?mode=update&poemId=${createdPoem.id}`);
	await expect(page.getByLabel('Title')).toHaveValue(updatedTitle);
	await page.getByLabel('Summary').fill('An unsaved summary that should be protected.');
	const cancelDialogPromise = page.waitForEvent('dialog');
	await page.getByRole('link', { name: 'Home' }).first().click();
	const cancelDialog = await cancelDialogPromise;
	expect(cancelDialog.message()).toContain('unsaved changes');
	await cancelDialog.dismiss();
	await expect(page).toHaveURL(`/admin?mode=update&poemId=${createdPoem.id}`);
	expect(await page.getByLabel('Summary').inputValue()).toBe(
		'An unsaved summary that should be protected.',
	);

	const discardDialogPromise = page.waitForEvent('dialog');
	await page.getByRole('link', { name: 'Home' }).first().click();
	const discardDialog = await discardDialogPromise;
	await discardDialog.accept();
	await expect(page).toHaveURL('/');

	await signOut(page);
	const readerPage = await page.context().newPage();
	await signIn(readerPage, reader);
	const unauthorizedDraftResponse = readerPage.waitForResponse(
		(response) =>
			response.request().method() === 'GET' &&
			new URL(response.url()).pathname === `/api/v1/poems/${createdPoem.id}`,
	);
	await readerPage.goto(`/admin?mode=update&poemId=${createdPoem.id}`);
	expect((await unauthorizedDraftResponse).ok()).toBe(false);
	await expect(readerPage.getByLabel('Title')).not.toHaveValue(updatedTitle);
	await readerPage.close();
});
