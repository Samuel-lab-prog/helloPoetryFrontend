import { expect, type Page, test } from '@playwright/test';

import { mockLoggedOutHome } from '../home/helpers';
import { clearClientAuth } from './helpers';

const publicLinks = [
	{ href: '/', name: 'Home' },
	{ href: '/poets', name: 'Poets' },
	{ href: '/register', name: 'Sign up' },
	{ href: '/login', name: 'Sign in' },
];

const privateHrefs = ['/poems/new', '/my-profile', '/notifications', '/admin', '/admin/moderation'];

async function expectVisibleNavLink(page: Page, href: string, name: string) {
	const links = page.locator(`a[href="${href}"]`);

	await expect
		.poll(async () => {
			const count = await links.count();
			for (let index = 0; index < count; index += 1) {
				const link = links.nth(index);
				if (!(await link.isVisible())) continue;

				const [label, text] = await Promise.all([
					link.getAttribute('aria-label'),
					link.innerText().catch(() => ''),
				]);
				if (label?.includes(name) || text.includes(name)) return true;
			}
			return false;
		})
		.toBe(true);
}

async function expectLoggedOutNavbar(page: Page) {
	await mockLoggedOutHome(page);
	await page.goto('/');

	for (const link of publicLinks) {
		await expectVisibleNavLink(page, link.href, link.name);
	}

	for (const href of privateHrefs) {
		await expect(page.locator(`a[href="${href}"]`)).toHaveCount(0);
	}
}

test.describe('logged out navbar', () => {
	test.beforeEach(async ({ page }) => {
		await clearClientAuth(page);
	});

	test('shows only public navigation links on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		await expectLoggedOutNavbar(page);
	});

	test('shows only public navigation links on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });

		await expectLoggedOutNavbar(page);
	});
});
