export const FORBIDDEN_WORDS = [
	'caralho',
	'carai',
	'porra',
	'merda',
	'bosta',
	'buceta',
	'xota',
	'puta',
	'putaria',
	'cu',
	'foder',
	'foda',
	'fudido',
	'arrombado',
	'arrombada',
	'otario',
	'otaria',
	'idiota',
	'babaca',
	'fdp',
	'vsf',
	'vtnc',
	'pqp',
	'hitler',
	'adolf',
	'stalin',
	'mussolini',
	'franco',
	'salazar',
	'pinochet',
	'maotse',
	'polpot',
	'ceausescu',
	'enverhoxha',
	'kimilsung',
	'kimjongil',
	'kimjongun',
	'saddam',
	'hussein',
	'idiamin',
	'mobutu',
	'gadafi',
	'qaddafi',
	'milosevic',
] as const;

const LEET_CHAR_MAP: Record<string, string> = {
	'0': 'o',
	'1': 'i',
	'3': 'e',
	'4': 'a',
	'5': 's',
	'7': 't',
	'8': 'b',
	'9': 'g',
	'@': 'a',
	$: 's',
	'!': 'i',
	'+': 't',
};

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[01345789@!$+]/g, (char) => LEET_CHAR_MAP[char] ?? char)
		.replace(/[^a-z0-9\s]/g, ' ');
}

function simplifyRepeatedLetters(token: string) {
	return token.replace(/(.)\1+/g, '$1');
}

export function findForbiddenWords(value: string) {
	const baseTokens = normalizeText(value).split(/\s+/).filter(Boolean);
	const normalizedTokens = new Set<string>();

	for (const token of baseTokens) {
		normalizedTokens.add(token);
		normalizedTokens.add(simplifyRepeatedLetters(token));
	}

	return FORBIDDEN_WORDS.filter((word) => normalizedTokens.has(word));
}
