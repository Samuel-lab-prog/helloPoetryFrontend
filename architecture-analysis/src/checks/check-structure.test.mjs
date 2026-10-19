import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkStructure } from './check-structure.mjs';

const checkerPath = fileURLToPath(new URL('./check-structure.mjs', import.meta.url));

function withStructure(files, run) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hello-poetry-structure-'));
	try {
		for (const file of files) {
			const target = path.join(root, file);
			fs.mkdirSync(path.dirname(target), { recursive: true });
			fs.writeFileSync(target, '');
		}
		run(root);
	} finally {
		const resolved = path.resolve(root);
		assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
		assert.ok(path.basename(resolved).startsWith('hello-poetry-structure-'));
		fs.rmSync(resolved, { recursive: true, force: true });
	}
}

test('accepts app composition folders and feature-owned adapters/public folders', () => {
	withStructure(
		[
			'src/main.tsx',
			'src/vite-env.d.ts',
			'src/app/App.tsx',
			'src/app/bootstrap/registerApplicationDependencies.ts',
			'src/app/layouts/AppLayout.tsx',
			'src/app/providers/AppProviders.tsx',
			'src/app/routes/router.tsx',
			'src/core/index.ts',
			'src/test-support/authClientStore.ts',
			'src/features/poems/adapters/poemCache.ts',
			'src/features/poems/public/types.ts',
			'src/features/poems/use-cases/create-poem/Page.tsx',
		],
		(root) => assert.deepEqual(checkStructure(root), []),
	);
});

test('rejects unknown root entries, feature folders and non-kebab use-cases', () => {
	withStructure(
		[
			'src/main.tsx',
			'src/App.tsx',
			'src/features/poems/use-cases/create-poem/Page.tsx',
			'src/features/poems/use-cases/bad_name/Page.tsx',
			'src/features/poems/components/PoemCard.tsx',
			'src/features/BadName/use-cases/example/Page.tsx',
			'src/unowned.ts',
			'src/app/unowned/anything.ts',
		],
		(root) => {
			const violations = [
				'src/App.tsx: unexpected source root file',
				'src/unowned.ts: unexpected source root file',
				'src/app/unowned: unexpected app directory',
				'src/features/BadName: features must be directories named in kebab-case',
				'src/features/poems/components: use adapters/, internal/, public/ or use-cases/',
				'src/features/poems/use-cases/bad_name: use-case directories must use kebab-case',
			];
			assert.deepEqual(checkStructure(root), violations);

			const execution = spawnSync(process.execPath, [checkerPath], {
				cwd: root,
				encoding: 'utf8',
			});
			assert.equal(execution.status, 1, execution.stdout + execution.stderr);
		},
	);
});
