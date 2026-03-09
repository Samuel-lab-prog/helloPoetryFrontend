import { z } from 'zod';
import { FORBIDDEN_WORDS } from '../constants/forbiddenWords';

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

const createOrUpdatePoemSchemaBase = z.object({
	title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
	excerpt: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres'),
	content: z.string().min(100, 'O conteúdo deve ter pelo menos 100 caracteres'),
	tags: z.array(z.string().min(1, 'Tag invalida')).optional(),
	status: z.enum(['draft', 'published']),
	visibility: z.enum(['public', 'friends', 'private', 'unlisted']),
	isCommentable: z.boolean(),
	toUserIds: z
		.array(z.number().int().positive('ID de usuário inválido'))
		.max(5, 'Você pode dedicar para no máximo 5 usuários')
		.optional(),
});

export const createPoemSchema = createOrUpdatePoemSchemaBase.superRefine((data, ctx) => {
	const fields: Array<{ key: 'title' | 'excerpt' | 'content'; value: string }> = [
		{ key: 'title', value: data.title },
		{ key: 'excerpt', value: data.excerpt },
		{ key: 'content', value: data.content },
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

	for (const [index, tag] of (data.tags ?? []).entries()) {
		const forbiddenWordsFound = findForbiddenWords(tag);
		if (forbiddenWordsFound.length === 0) continue;

		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ['tags', index],
			message: `Tag contém palavras proibidas: ${forbiddenWordsFound.join(', ')}`,
		});
	}
});

export const deletePoemSchema = z.object({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});

export const updatePoemSchema = createOrUpdatePoemSchemaBase.extend({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});

export type CreatePoemType = z.infer<typeof createPoemSchema>;
export type DeletePoemType = z.infer<typeof deletePoemSchema>;
export type UpdatePoemType = z.infer<typeof updatePoemSchema>;
