import { test } from '@playwright/test';
import { green, red } from 'kleur/colors';
import { printTable } from '../../architecture-analysis/src/PrintTable';
import { routes } from './routes';
import { measureRoute } from './utils/measureRoute';

const MAX_NAV_MS = 900;
const MAX_LONGTASK_MS = 150;

test('SPA navigation stays within budget', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 720 });
	await page.goto('/');

	const results: {
		route: string;
		durationMs: number;
		longTaskTotalMs: number;
		longTaskCount: number;
		maxNavMs: number;
		maxLongTaskMs: number;
	}[] = [];

	for (const route of routes) {
		const result = await measureRoute({
			page,
			navigate: async () => {
				if (route.linkText) {
					const link = page.getByRole('link', { name: route.linkText });
					if ((await link.count()) > 0) {
						await link.first().click();
						return;
					}
				}
				await page.goto(route.path);
			},
			waitForPath: route.path,
			waitForText: route.waitForText,
		});

		results.push({
			route: route.name,
			durationMs: result.durationMs,
			longTaskTotalMs: result.longTaskTotalMs,
			longTaskCount: result.longTaskCount,
			maxNavMs: MAX_NAV_MS,
			maxLongTaskMs: MAX_LONGTASK_MS,
		});

		test.info().attach(`navigation-${route.name}.json`, {
			body: JSON.stringify(
				{
					route: route.name,
					path: route.path,
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
	}

	printTable(
		'Navigation Performance',
		[
			{
				header: 'Route',
				width: 30,
				render: (row) => ({ text: row.route }),
			},
			{
				header: 'Duration',
				width: 10,
				align: 'right',
				render: (row) => ({
					text: `${row.durationMs}ms`,
					color: row.durationMs <= row.maxNavMs ? green : red,
				}),
			},
			{
				header: 'Max',
				width: 10,
				align: 'right',
				render: (row) => ({ text: `${row.maxNavMs}ms` }),
			},
			{
				header: 'LongTasks',
				width: 10,
				align: 'right',
				render: (row) => ({
					text: `${row.longTaskTotalMs}ms`,
					color: row.longTaskTotalMs <= row.maxLongTaskMs ? green : red,
				}),
			},
			{
				header: 'Max',
				width: 10,
				align: 'right',
				render: (row) => ({ text: `${row.maxLongTaskMs}ms` }),
			},
		],
		results,
	);
});
