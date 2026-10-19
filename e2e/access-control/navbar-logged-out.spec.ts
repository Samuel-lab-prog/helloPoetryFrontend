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
			const matches = await Promise.all(
				Array.from({ length: count }, async (_, index) => {
					const link = links.nth(index);
					if (!(await link.isVisible())) return false;

					const [label, text] = await Promise.all([
						link.getAttribute('aria-label'),
						link.innerText().catch(() => ''),
					]);
					return label?.includes(name) || text.includes(name);
				}),
			);
			return matches.some(Boolean);
		})
		.toBe(true);
}

async function expectLoggedOutNavbar(page: Page) {
	await mockLoggedOutHome(page);
	await page.goto('/');

	await Promise.all(publicLinks.map((link) => expectVisibleNavLink(page, link.href, link.name)));

	await Promise.all(
		privateHrefs.map((href) => expect(page.locator(`a[href="${href}"]`)).toHaveCount(0)),
	);
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
