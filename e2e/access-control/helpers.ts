import { expect, type Page } from '@playwright/test';

type AuthRequiredCardExpectation = {
	description?: string | RegExp;
	eyebrow: string | RegExp;
	title: string | RegExp;
};

export async function clearClientAuth(page: Page) {
	await page.context().clearCookies();
	await page.addInitScript(() => {
		window.localStorage.clear();
		window.sessionStorage.clear();
	});
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
