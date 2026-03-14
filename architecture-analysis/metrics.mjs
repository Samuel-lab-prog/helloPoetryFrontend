import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { bold, cyan, yellow } from 'kleur/colors';

const CODE_EXTENSIONS = new Set(['.ts', '.tsx']);
const SEP = ' | ';

function padLeft(text, length) {
	if (text.length >= length) return text;
	return ' '.repeat(length - text.length) + text;
}

function padRight(text, length) {
	if (text.length >= length) return text;
	return text + ' '.repeat(length - text.length);
}

function divider(char, length) {
	return char.repeat(length);
}

function section(title) {
	console.log('');
	console.log(bold(title.toUpperCase()));
	console.log(divider('─', 120));
}

function printTable(title, columns, rows) {
	const totalWidth =
		columns.reduce((sum, c) => sum + c.width, 0) + SEP.length * (columns.length - 1);

	section(title);

	console.log(
		bold(
			columns.map((c) => (c.align === 'right' ? padLeft : padRight)(c.header, c.width)).join(SEP),
		),
	);

	console.log(divider('·', totalWidth));

	rows.forEach((row) => {
		console.log(
			columns
				.map((c) => {
					const text = c.render(row);
					const padded = c.align === 'right' ? padLeft(text, c.width) : padRight(text, c.width);
					return c.color ? c.color(padded) : padded;
				})
				.join(SEP),
		);
	});
}

function listFilesRecursive(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];

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

function countFeatureFolders(srcDir) {
	const featuresDir = path.join(srcDir, 'features');
	if (!fs.existsSync(featuresDir)) return 0;
	return fs.readdirSync(featuresDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())
		.length;
}

function listFeatureDirs(srcDir) {
	const featuresDir = path.join(srcDir, 'features');
	if (!fs.existsSync(featuresDir)) return [];
	return fs
		.readdirSync(featuresDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			name: entry.name,
			path: path.join(featuresDir, entry.name),
		}));
}

function runCloc(srcDir) {
	try {
		const output = execSync('npx --yes cloc --json --quiet --by-file src', {
			cwd: srcDir,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});
		return JSON.parse(output);
	} catch {
		return null;
	}
}

function listClocFiles(cloc) {
	if (!cloc) return [];
	return Object.keys(cloc).filter(
		(key) => key !== 'SUM' && key !== 'header' && typeof cloc[key] === 'object',
	);
}

function countCodeFilesFromCloc(cloc) {
	const files = listClocFiles(cloc);
	return files.filter((file) => CODE_EXTENSIONS.has(path.extname(file))).length;
}

function sumClocLines(cloc, fileFilter) {
	let loc = 0;
	let comments = 0;
	let blanks = 0;

	if (cloc?.SUM && !fileFilter) {
		return {
			loc: cloc.SUM.code || 0,
			comments: cloc.SUM.comment || 0,
			blanks: cloc.SUM.blank || 0,
		};
	}

	for (const file of listClocFiles(cloc)) {
		if (fileFilter && !fileFilter(file)) continue;
		const info = cloc[file];
		loc += info.code || 0;
		comments += info.comment || 0;
		blanks += info.blank || 0;
	}

	return { loc, comments, blanks };
}

function printFrontendOverview() {
	const projectDir = process.cwd();
	const srcDir = path.resolve(projectDir, 'src');
	const files = listFilesRecursive(srcDir);
	const asUnix = (filePath) => filePath.replace(/\\/g, '/');
	const cloc = runCloc(projectDir);
	const clocFiles = listClocFiles(cloc);
	const hasClocFiles = clocFiles.length > 0;
	const effectiveFiles = hasClocFiles ? clocFiles : files;

	const isTsx = (filePath) => path.extname(filePath) === '.tsx';
	const isTs = (filePath) => path.extname(filePath) === '.ts';

	const isFeaturePage = (filePath) => {
		const normalized = asUnix(filePath);
		return isTsx(filePath) && normalized.includes('/features/') && normalized.includes('/pages/');
	};

	const isComponent = (filePath) => {
		const normalized = asUnix(filePath);
		if (!isTsx(filePath)) return false;
		return (
			normalized.includes('/components/') &&
			(normalized.includes('/features/') || normalized.includes('/src/components/'))
		);
	};

	const isHook = (filePath) => {
		const normalized = asUnix(filePath);
		return (
			(isTs(filePath) || isTsx(filePath)) &&
			normalized.includes('/features/') &&
			normalized.includes('/hooks/')
		);
	};

	const isApiModule = (filePath) => {
		const normalized = asUnix(filePath);
		return isTs(filePath) && normalized.includes('/core/api/');
	};

	const lineTotals = cloc ? sumClocLines(cloc) : { loc: 0, comments: 0, blanks: 0 };

	const totals = [
		{
			label: 'TOTAL TS/TSX FILES',
			value: hasClocFiles ? countCodeFilesFromCloc(cloc) : countCodeFiles(files),
		},
		{ label: 'FEATURES', value: countFeatureFolders(srcDir) },
		{
			label: 'PAGES',
			value: effectiveFiles.filter(isFeaturePage).length,
		},
		{
			label: 'COMPONENTS',
			value: effectiveFiles.filter(isComponent).length,
		},
		{
			label: 'HOOKS',
			value: effectiveFiles.filter(isHook).length,
		},
		{
			label: 'API MODULES',
			value: effectiveFiles.filter(isApiModule).length,
		},
		{ label: 'LOC', value: lineTotals.loc },
		{ label: 'COMMENTS', value: lineTotals.comments },
		{ label: 'BLANKS', value: lineTotals.blanks },
	];

	const columns = [
		{
			header: 'METRIC',
			width: 90,
			render: (m) => m.label,
			color: cyan,
		},
		{
			header: 'TOTAL',
			width: 27,
			align: 'right',
			render: (m) => String(m.value),
			color: yellow,
		},
	];

	printTable('Frontend Overview', columns, totals);

	const features = listFeatureDirs(srcDir);
	if (!features.length) return;

	const featureRows = features.map((feature) => {
		const featureFiles = hasClocFiles ? clocFiles : listFilesRecursive(feature.path);
		const featureBaseRelative = asUnix(path.relative(projectDir, feature.path));
		const featureBaseAbsolute = asUnix(feature.path);
		const isWithinFeature = (file) => {
			const normalized = asUnix(file);
			return (
				normalized.includes(featureBaseRelative + '/') ||
				normalized.includes('/' + featureBaseRelative + '/') ||
				normalized.includes(featureBaseAbsolute + '/')
			);
		};
		const featureLines = cloc
			? sumClocLines(cloc, isWithinFeature)
			: { loc: 0, comments: 0, blanks: 0 };
		const featurePages = featureFiles.filter((file) => {
			const normalized = asUnix(file);
			return (
				isWithinFeature(file) && path.extname(file) === '.tsx' && normalized.includes('/pages/')
			);
		}).length;
		const featureComponents = featureFiles.filter((file) => {
			const normalized = asUnix(file);
			return (
				isWithinFeature(file) &&
				path.extname(file) === '.tsx' &&
				normalized.includes('/components/')
			);
		}).length;
		const featureHooks = featureFiles.filter((file) => {
			const normalized = asUnix(file);
			return (
				isWithinFeature(file) &&
				(path.extname(file) === '.ts' || path.extname(file) === '.tsx') &&
				normalized.includes('/hooks/')
			);
		}).length;

		return {
			feature: feature.name,
			files: featureFiles.filter(
				(file) => isWithinFeature(file) && CODE_EXTENSIONS.has(path.extname(file)),
			).length,
			pages: featurePages,
			components: featureComponents,
			hooks: featureHooks,
			loc: featureLines.loc,
		};
	});

	const featureColumns = [
		{
			header: 'FEATURE',
			width: 32,
			render: (m) => m.feature,
			color: cyan,
		},
		{
			header: 'FILES',
			width: 12,
			align: 'right',
			render: (m) => String(m.files),
			color: yellow,
		},
		{
			header: 'PAGES',
			width: 12,
			align: 'right',
			render: (m) => String(m.pages),
			color: yellow,
		},
		{
			header: 'COMPONENTS',
			width: 14,
			align: 'right',
			render: (m) => String(m.components),
			color: yellow,
		},
		{
			header: 'HOOKS',
			width: 12,
			align: 'right',
			render: (m) => String(m.hooks),
			color: yellow,
		},
		{
			header: 'LOC',
			width: 30,
			align: 'right',
			render: (m) => String(m.loc),
			color: yellow,
		},
	];

	const sortedFeatureRows = featureRows.sort((a, b) => b.loc - a.loc);
	printTable('Frontend Features', featureColumns, sortedFeatureRows);
}

printFrontendOverview();
