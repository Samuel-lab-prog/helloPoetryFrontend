import { z } from 'zod';
import { FORBIDDEN_WORDS } from '../../admin/constants/forbiddenWords';

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
	'$': 's',
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
			.min(3, 'Apelido deve ter pelo menos 3 caracteres')
			.max(30, 'Apelido deve ter no máximo 30 caracteres')
			.regex(/^[a-zA-Z0-9_]+$/, 'Apelido pode conter apenas letras, números e underscores'),
		name: z
			.string()
			.trim()
			.min(3, 'Nome deve ter pelo menos 3 caracteres')
			.max(30, 'Nome deve ter no máximo 30 caracteres'),
		email: z.email('E-mail inválido').trim(),
		password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
		bio: z.string().trim(),
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
