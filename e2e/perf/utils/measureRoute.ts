import type { Page } from '@playwright/test';

export type NavResult = {
	durationMs: number;
	longTaskTotalMs: number;
	longTaskCount: number;
};

export async function measureRoute({
	page,
	navigate,
	waitForText,
	waitForSelector = 'main',
	waitForPath,
}: {
	page: Page;
	navigate: () => Promise<void>;
	waitForText?: string;
	waitForSelector?: string;
	waitForPath?: string;
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
	await navigate();
	if (waitForPath) {
		await page.waitForURL((url) => url.pathname === waitForPath);
	}
	if (waitForText) {
		await page.getByText(waitForText).first().waitFor();
	} else if (waitForSelector) {
		await page.locator(waitForSelector).first().waitFor();
	}

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
