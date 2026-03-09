import { z } from 'zod';
import { FORBIDDEN_WORDS } from '@features/base';

export const REGISTER_NICKNAME_MIN_LENGTH = 3;
export const REGISTER_NICKNAME_MAX_LENGTH = 30;
export const REGISTER_NAME_MIN_LENGTH = 3;
export const REGISTER_NAME_MAX_LENGTH = 30;
export const REGISTER_PASSWORD_MIN_LENGTH = 8;
export const REGISTER_PASSWORD_MAX_LENGTH = 30;
export const REGISTER_BIO_MIN_LENGTH = 0;
export const REGISTER_BIO_MAX_LENGTH = 300;

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

function findForbiddenWords(value: string) {
	const baseTokens = normalizeText(value).split(/\s+/).filter(Boolean);
	const normalizedTokens = new Set<string>();

	for (const token of baseTokens) {
		normalizedTokens.add(token);
		normalizedTokens.add(simplifyRepeatedLetters(token));
	}

	return FORBIDDEN_WORDS.filter((word) => normalizedTokens.has(word));
}

export const registerSchema = z
	.object({
		nickname: z
			.string()
			.trim()
			.min(
				REGISTER_NICKNAME_MIN_LENGTH,
				`Apelido deve ter pelo menos ${REGISTER_NICKNAME_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_NICKNAME_MAX_LENGTH,
				`Apelido deve ter no máximo ${REGISTER_NICKNAME_MAX_LENGTH} caracteres`,
			)
			.regex(/^[a-zA-Z0-9_]+$/, 'Apelido pode conter apenas letras, números e underscores'),
		name: z
			.string()
			.trim()
			.min(
				REGISTER_NAME_MIN_LENGTH,
				`Nome deve ter pelo menos ${REGISTER_NAME_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_NAME_MAX_LENGTH,
				`Nome deve ter no máximo ${REGISTER_NAME_MAX_LENGTH} caracteres`,
			),
		email: z.email('E-mail inválido').trim(),
		password: z
			.string()
			.min(
				REGISTER_PASSWORD_MIN_LENGTH,
				`A senha deve ter pelo menos ${REGISTER_PASSWORD_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_PASSWORD_MAX_LENGTH,
				`A senha deve ter no máximo ${REGISTER_PASSWORD_MAX_LENGTH} caracteres`,
			),
		bio: z
			.string()
			.trim()
			.min(REGISTER_BIO_MIN_LENGTH, `Bio deve ter pelo menos ${REGISTER_BIO_MIN_LENGTH} caracteres`)
			.max(REGISTER_BIO_MAX_LENGTH, `Bio deve ter no máximo ${REGISTER_BIO_MAX_LENGTH} caracteres`),
		avatarUrl: z.url('URL inválida').optional(),
	})
	.superRefine((data, ctx) => {
		const fields: Array<{ key: 'nickname' | 'name' | 'bio'; value: string }> = [
			{ key: 'nickname', value: data.nickname },
			{ key: 'name', value: data.name },
			{ key: 'bio', value: data.bio },
		];

		for (const field of fields) {
			const forbiddenWordsFound = findForbiddenWords(field.value);
			if (forbiddenWordsFound.length === 0) continue;

			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: [field.key],
				message: `Remova palavras proibidas: ${forbiddenWordsFound.join(', ')}`,
			});
		}
	});

export type RegisterDataType = z.infer<typeof registerSchema>;
