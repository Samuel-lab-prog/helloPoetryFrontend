import { bold } from 'kleur/colors';

export function padLeft(text: string, length: number): string {
	if (text.length >= length) return text;
	return ' '.repeat(length - text.length) + text;
}

export function padRight(text: string, length: number): string {
	if (text.length >= length) return text;
	return text + ' '.repeat(length - text.length);
}

export function divider(char: string, length: number): string {
	return char.repeat(length);
}

export function section(title: string): void {
	console.log('');
	console.log(bold(title.toUpperCase()));
	console.log(divider('─', 120));
}
