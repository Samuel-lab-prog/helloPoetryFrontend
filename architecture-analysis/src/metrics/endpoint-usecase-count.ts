import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../PrintTable';

type TotalMetric = {
	label: string;
	value: number;
};

const USE_CASE_FOLDER_PATTERN = /(?:^|\/)src\/features\/[^/]+\/use-cases\/([^/]+)\//;
const USE_CASE_PAGE_PATTERN = /(?:^|\/)src\/features\/[^/]+\/use-cases\/[^/]+\/Page\.tsx$/;

function normalizePath(file: string): string {
	return file.replace(/\\/g, '/');
}

function countUseCases(cloc: ClocResult): number {
	const useCases = new Set<string>();

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		const normalized = normalizePath(file);
		const match = normalized.match(USE_CASE_FOLDER_PATTERN);
		if (!match) continue;
		const parts = normalized.split('/');
		const feature = parts[2];
		const useCase = match[1];
		useCases.add(`src/features/${feature}/use-cases/${useCase}`);
	}

	return useCases.size;
}

function countPages(cloc: ClocResult): number {
	let total = 0;

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		const normalized = normalizePath(file);
		if (USE_CASE_PAGE_PATTERN.test(normalized)) total += 1;
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
