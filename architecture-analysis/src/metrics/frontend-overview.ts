import fs from 'fs';
import path from 'path';
import { printTable, type TableColumn } from '../PrintTable';

type TotalMetric = {
	label: string;
	value: number;
};

const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);

function resolveFrontendSrc(): string {
	const cwd = process.cwd();
	return path.resolve(cwd, 'src');
}

function listFilesRecursive(dir: string): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...listFilesRecursive(fullPath));
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

function countCodeFiles(files: string[]): number {
	return files.filter((file) => CODE_EXTENSIONS.has(path.extname(file))).length;
}

function countFeatureFolders(srcDir: string): number {
	const featuresDir = path.join(srcDir, 'features');
	if (!fs.existsSync(featuresDir)) return 0;
	return fs.readdirSync(featuresDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
		.length;
}

export function printFrontendOverview(): void {
	const srcDir = resolveFrontendSrc();
	const files = listFilesRecursive(srcDir);
	const asUnix = (filePath: string) => filePath.replace(/\\/g, '/');

	const isTsx = (filePath: string) => path.extname(filePath) === '.tsx';
	const isTs = (filePath: string) => path.extname(filePath) === '.ts';

	const isFeaturePage = (filePath: string) => {
		const normalized = asUnix(filePath);
		return isTsx(filePath) && normalized.includes('/features/') && normalized.includes('/pages/');
	};

	const isComponent = (filePath: string) => {
		const normalized = asUnix(filePath);
		if (!isTsx(filePath)) return false;
		return (
			normalized.includes('/components/') &&
			(normalized.includes('/features/') || normalized.includes('/src/components/'))
		);
	};

	const isHook = (filePath: string) => {
		const normalized = asUnix(filePath);
		return (
			(isTs(filePath) || isTsx(filePath)) &&
			normalized.includes('/features/') &&
			normalized.includes('/hooks/')
		);
	};

	const isApiModule = (filePath: string) => {
		const normalized = asUnix(filePath);
		return isTs(filePath) && normalized.includes('/core/api/');
	};

	const totals: TotalMetric[] = [
		{ label: 'TOTAL TS/TSX FILES', value: countCodeFiles(files) },
		{ label: 'FEATURES', value: countFeatureFolders(srcDir) },
		{ label: 'PAGES', value: files.filter(isFeaturePage).length },
		{ label: 'COMPONENTS', value: files.filter(isComponent).length },
		{ label: 'HOOKS', value: files.filter(isHook).length },
		{ label: 'API MODULES', value: files.filter(isApiModule).length },
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

	printTable('Frontend Overview', columns, totals);
}
