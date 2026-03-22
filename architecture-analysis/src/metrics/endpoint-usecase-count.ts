import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../PrintTable';

type TotalMetric = {
	label: string;
	value: number;
};

const USE_CASE_PATTERN = /(?:^|[\\/])src[\\/]features[\\/][^\\/]+[\\/]use-cases[\\/].+\\.(ts|tsx)$/;

const PAGE_PATTERN = /(?:^|[\\/])src[\\/]features[\\/][^\\/]+[\\/]pages[\\/].+\\.tsx$/;

function countUseCases(cloc: ClocResult): number {
	let total = 0;

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		if (USE_CASE_PATTERN.test(file)) total += 1;
	}

	return total;
}

function countPages(cloc: ClocResult): number {
	let total = 0;

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		if (PAGE_PATTERN.test(file)) total += 1;
	}

	return total;
}

export function printEndpointAndUseCaseTotals(cloc: ClocResult): void {
	const totals: TotalMetric[] = [
		{ label: 'TOTAL PAGES', value: countPages(cloc) },
		{ label: 'TOTAL USE-CASES', value: countUseCases(cloc) },
	];

	const columns: TableColumn<TotalMetric>[] = [
		{
			header: 'METRIC',
			width: 90,
			render: (m) => ({ text: m.label }),
		},
		{
			header: 'TOTAL',
			width: 27,
			align: 'right',
			render: (m) => ({ text: String(m.value) }),
		},
	];

	printTable('Pages & Use-Case Totals', columns, totals);
}
