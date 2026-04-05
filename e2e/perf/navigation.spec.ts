import { expect, test } from '@playwright/test';

const MAX_NAV_MS = 900;
const MAX_LONGTASK_MS = 150;

type NavResult = {
	durationMs: number;
	longTaskTotalMs: number;
	longTaskCount: number;
};

test('SPA navigation stays within budget', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('/');

	const result = await measureRoute({
		page,
		linkText: 'Poets',
		urlPattern: /\/poets$/,
		waitForText: 'Search poets',
	});

	test.info().attach('navigation-metrics.json', {
		body: JSON.stringify(
			{
				durationMs: result.durationMs,
				longTaskTotalMs: result.longTaskTotalMs,
				longTaskCount: result.longTaskCount,
				budgets: {
					maxNavMs: MAX_NAV_MS,
					maxLongTaskTotalMs: MAX_LONGTASK_MS,
				},
			},
			null,
			2,
		),
		contentType: 'application/json',
	});

	expect(result.durationMs, `Navigation took ${result.durationMs}ms`).toBeLessThan(MAX_NAV_MS);
	expect(
		result.longTaskTotalMs,
		`Long tasks total ${result.longTaskTotalMs}ms across ${result.longTaskCount} tasks`,
	).toBeLessThan(MAX_LONGTASK_MS);
});

async function measureRoute({
	page,
	linkText,
	urlPattern,
	waitForText,
}: {
	page: import('@playwright/test').Page;
	linkText: string;
	urlPattern: RegExp;
	waitForText: string;
}): Promise<NavResult> {
	await page.evaluate(() => {
		const longTasks: number[] = [];
		const observer = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.entryType === 'longtask') longTasks.push(entry.duration);
			}
		});
		try {
			observer.observe({ entryTypes: ['longtask'] });
		} catch {
			// Long task API not available; keep metrics empty.
		}
		(window as typeof window & { __navPerf?: { longTasks: number[] } }).__navPerf = {
			longTasks,
		};
	});

	const start = Date.now();
	await page.getByRole('link', { name: linkText }).first().click();
	await page.waitForURL(urlPattern);
	await page.getByText(waitForText).first().waitFor();

	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			}),
	);

	const durationMs = Date.now() - start;
	const { longTasks } = await page.evaluate(() => {
		const data = (window as typeof window & { __navPerf?: { longTasks: number[] } }).__navPerf;
		return { longTasks: data?.longTasks ?? [] };
	});

	const longTaskTotalMs = Math.round(longTasks.reduce((sum, duration) => sum + duration, 0));

	return {
		durationMs,
		longTaskTotalMs,
		longTaskCount: longTasks.length,
	};
}
