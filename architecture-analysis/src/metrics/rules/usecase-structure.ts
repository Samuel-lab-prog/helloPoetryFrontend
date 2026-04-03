import { green, red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../Types';
import { printRulesTable, type TableColumn } from '../../PrintTable';

type UseCaseInfo = {
	feature: string;
	path: string;
	rootFiles: Set<string>;
	childFolders: Set<string>;
};

type Violation = {
	feature: string;
	useCase: string;
	path: string;
	reason: string;
};

const USE_CASE_REGEX = /^src\/features\/([^/]+)\/use-cases\/([^/]+)\/(.+)/;
const USE_CASE_FILE_AT_ROOT_REGEX = /^src\/features\/([^/]+)\/use-cases\/([^/]+)$/;
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_USECASE_FOLDERS = ['components', 'hooks', 'schemas', 'utils'];
const REQUIRED_ROOT_FILE = 'Page.tsx';

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

function truncate(text: string, width: number): string {
	if (text.length <= width) return text;
	if (width <= 3) return text.slice(0, width);
	return `${text.slice(0, width - 3)}...`;
}

export function checkUseCaseStructure(cloc: ClocResult): Violation[] {
	const useCases = new Map<string, UseCaseInfo>();
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);

		const fileAtRootMatch = path.match(USE_CASE_FILE_AT_ROOT_REGEX);
		if (fileAtRootMatch) {
			const [, feature, fileName] = fileAtRootMatch;
			violations.push({
				feature,
				useCase: '(root)',
				path: `src/features/${feature}/use-cases/${fileName}`,
				reason: 'Use-cases must be folders (no files at root).',
			});
			continue;
		}

		const match = path.match(USE_CASE_REGEX);
		if (!match) continue;

		const [, feature, useCaseFolder, fileName] = match;
		const useCasePath = `src/features/${feature}/use-cases/${useCaseFolder}`;
		const key = `${feature}:${useCaseFolder}`;

		const entry = useCases.get(key) ?? {
			feature,
			path: useCasePath,
			rootFiles: new Set<string>(),
			childFolders: new Set<string>(),
		};

		const segments = fileName.split('/');
		if (segments.length === 1) {
			entry.rootFiles.add(segments[0]);
		} else {
			entry.childFolders.add(segments[0]);
		}

		if (!useCases.has(key)) useCases.set(key, entry);

		if (!KEBAB_CASE_REGEX.test(useCaseFolder)) {
			const id = `${feature}:${useCaseFolder}:kebab`;
			if (!seen.has(id)) {
				violations.push({
					feature,
					useCase: useCaseFolder,
					path: useCasePath,
					reason: 'Use-case folder must be kebab-case.',
				});
				seen.add(id);
			}
		}
	}

	for (const useCase of useCases.values()) {
		if (!useCase.rootFiles.has(REQUIRED_ROOT_FILE)) {
			violations.push({
				feature: useCase.feature,
				useCase: useCase.path.split('/').at(-1) ?? useCase.path,
				path: useCase.path,
				reason: 'Missing Page.tsx.',
			});
		}

		const invalidRootFiles = [...useCase.rootFiles].filter((file) => file !== REQUIRED_ROOT_FILE);
		if (invalidRootFiles.length > 0) {
			violations.push({
				feature: useCase.feature,
				useCase: useCase.path.split('/').at(-1) ?? useCase.path,
				path: useCase.path,
				reason: `Unexpected files: ${invalidRootFiles.join(', ')}`,
			});
		}

		const invalidFolders = [...useCase.childFolders].filter(
			(folder) => !ALLOWED_USECASE_FOLDERS.includes(folder),
		);
		if (invalidFolders.length > 0) {
			violations.push({
				feature: useCase.feature,
				useCase: useCase.path.split('/').at(-1) ?? useCase.path,
				path: useCase.path,
				reason: `Unexpected folders: ${invalidFolders.join(', ')}`,
			});
		}
	}

	return violations;
}

export function printUseCaseStructureViolations(cloc: ClocResult): void {
	const violations = checkUseCaseStructure(cloc);

	if (violations.length === 0) {
		console.log(green('? Rules: All use-cases follow folder structure'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FEATURE',
			width: 22,
			render: (v) => ({ text: truncate(v.feature, 22), color: red }),
		},
		{
			header: 'USE-CASE',
			width: 22,
			render: (v) => ({ text: truncate(v.useCase, 22) }),
		},
		{
			header: 'PATH',
			width: 48,
			render: (v) => ({ text: truncate(v.path, 48) }),
		},
		{
			header: 'REASON',
			width: 32,
			render: (v) => ({ text: truncate(v.reason, 32), color: yellow }),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printRulesTable(`Use-case structure violations (${violations.length})`, columns, violations);
}
