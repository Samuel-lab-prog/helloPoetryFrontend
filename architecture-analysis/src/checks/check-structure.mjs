import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const allowedRootDirectories = new Set(['app', 'contracts', 'core', 'features', 'test-support']);
const allowedRootFiles = new Set(['main.tsx', 'vite-env.d.ts']);
const allowedFeatureDirectories = new Set(['adapters', 'internal', 'public', 'use-cases']);
const allowedAppDirectories = new Set(['bootstrap', 'layouts', 'providers', 'routes']);
const allowedAppFiles = new Set(['App.tsx']);
const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function checkStructure(root) {
	const sourceRoot = path.join(root, 'src');
	const violations = [];
	if (!fs.existsSync(sourceRoot)) return ['src: source directory is missing'];

	const entries = (directory) => fs.readdirSync(directory, { withFileTypes: true });
	for (const entry of entries(sourceRoot)) {
		if (entry.isDirectory()) {
			if (!allowedRootDirectories.has(entry.name)) {
				violations.push(`src/${entry.name}: unexpected source directory`);
			}
		} else if (!allowedRootFiles.has(entry.name)) {
			violations.push(`src/${entry.name}: unexpected source root file`);
		}
	}

	const appRoot = path.join(sourceRoot, 'app');
	if (fs.existsSync(appRoot)) {
		for (const entry of entries(appRoot)) {
			if (entry.isDirectory() && !allowedAppDirectories.has(entry.name)) {
				violations.push(`src/app/${entry.name}: unexpected app directory`);
			} else if (!entry.isDirectory() && !allowedAppFiles.has(entry.name)) {
				violations.push(`src/app/${entry.name}: unexpected app root file`);
			}
		}
	}

	const featuresRoot = path.join(sourceRoot, 'features');
	if (!fs.existsSync(featuresRoot))
		return [...violations, 'src/features: feature directory is missing'];

	for (const feature of entries(featuresRoot)) {
		const featurePath = `src/features/${feature.name}`;
		if (!feature.isDirectory() || !kebabCase.test(feature.name)) {
			violations.push(`${featurePath}: features must be directories named in kebab-case`);
			continue;
		}

		for (const directory of entries(path.join(featuresRoot, feature.name))) {
			if (!directory.isDirectory() || !allowedFeatureDirectories.has(directory.name)) {
				violations.push(
					`${featurePath}/${directory.name}: use adapters/, internal/, public/ or use-cases/`,
				);
				continue;
			}

			if (directory.name === 'use-cases') {
				for (const useCase of entries(path.join(featuresRoot, feature.name, directory.name))) {
					if (!useCase.isDirectory() || !kebabCase.test(useCase.name)) {
						violations.push(
							`${featurePath}/use-cases/${useCase.name}: use-case directories must use kebab-case`,
						);
					}
				}
			}
		}
	}

	return violations;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const violations = checkStructure(process.cwd());
	if (violations.length > 0) {
		console.error(violations.join('\n'));
		process.exitCode = 1;
	} else {
		console.log('Frontend structure check passed.');
	}
}
