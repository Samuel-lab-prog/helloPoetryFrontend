import { red, green } from 'kleur/colors';
import type { DepcruiseResult } from '../../Types';
import { printRulesTable, type TableColumn } from '../../PrintTable';
import { isRootLevelSourceFile } from '../../Utils';

type Violation = {
	module: string;
};

const ALLOWED_ROOT_FILES = ['src/main.tsx', 'src/App.tsx', 'src/vite-env.d.ts'];

function checkNoRootSourceCode(cruiseResult: DepcruiseResult): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;

		if (isRootLevelSourceFile(source) && !ALLOWED_ROOT_FILES.includes(source))
			violations.push({ module: source });
	}

	return violations;
}

export function printNoRootSourceCode(cruiseResult: DepcruiseResult): void {
	const violations = checkNoRootSourceCode(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ Rules: No source files found at src root'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'MODULE',
			width: 80,
			render: (v) => ({ text: v.module, color: red }),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printRulesTable(`Root-level source files (${violations.length})`, columns, violations);
}
