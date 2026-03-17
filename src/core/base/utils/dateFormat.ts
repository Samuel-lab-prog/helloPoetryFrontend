export function formatDate(
	date: Date | string,
	options?: Intl.DateTimeFormatOptions,
	locale: string = 'pt-BR',
): string {
	const parsedDate = typeof date === 'string' ? new Date(date) : date;

	if (Number.isNaN(parsedDate.getTime())) {
		return 'Data inválida';
	}

	return parsedDate.toLocaleString(locale, {
		dateStyle: 'medium',
		timeStyle: 'short',
		...options,
	});
}

export function formatRelativeTime(input?: string | Date) {
	if (!input) return '';

	const date = input instanceof Date ? input : new Date(input);
	if (Number.isNaN(date.getTime())) return '';

	const diffMs = Date.now() - date.getTime();
	if (diffMs < 0) return 'agora';

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const month = 30 * day;
	const year = 365 * day;

	if (diffMs < minute) return 'agora';
	if (diffMs < hour) return `${Math.floor(diffMs / minute)}m atrás`;
	if (diffMs < day) return `${Math.floor(diffMs / hour)}h atrás`;
	if (diffMs < month) return `${Math.floor(diffMs / day)}d atrás`;
	if (diffMs < year) return `${Math.floor(diffMs / month)}mo atrás`;
	return `${Math.floor(diffMs / year)}a atrás`;
}
