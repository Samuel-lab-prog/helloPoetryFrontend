import { z } from 'zod';
import { FORBIDDEN_WORDS } from '@features/base';
import {
	POEM_CONTENT_MAX_LENGTH,
	POEM_CONTENT_MIN_LENGTH,
	POEM_EXCERPT_MAX_LENGTH,
	POEM_EXCERPT_MIN_LENGTH,
	POEM_TAG_MAX_LENGTH,
	POEM_TAGS_MAX_AMOUNT,
	POEM_TITLE_MAX_LENGTH,
	POEM_TITLE_MIN_LENGTH,
} from '../constants/poemConstants';

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

const createOrUpdatePoemSchemaBase = z.object({
	title: z
		.string()
		.min(POEM_TITLE_MIN_LENGTH, `O título deve ter pelo menos ${POEM_TITLE_MIN_LENGTH} caracteres`)
		.max(POEM_TITLE_MAX_LENGTH, `O título deve ter no máximo ${POEM_TITLE_MAX_LENGTH} caracteres`),
	excerpt: z
		.string()
		.min(
			POEM_EXCERPT_MIN_LENGTH,
			`O resumo deve ter pelo menos ${POEM_EXCERPT_MIN_LENGTH} caracteres`,
		)
		.max(
			POEM_EXCERPT_MAX_LENGTH,
			`O resumo deve ter no máximo ${POEM_EXCERPT_MAX_LENGTH} caracteres`,
		),
	content: z
		.string()
		.min(
			POEM_CONTENT_MIN_LENGTH,
			`O conteúdo deve ter pelo menos ${POEM_CONTENT_MIN_LENGTH} caracteres`,
		)
		.max(
			POEM_CONTENT_MAX_LENGTH,
			`O conteúdo deve ter no máximo ${POEM_CONTENT_MAX_LENGTH} caracteres`,
		),
	tags: z
		.array(
			z
				.string()
				.min(1, 'Tag inválida')
				.max(POEM_TAG_MAX_LENGTH, `Tag deve ter no máximo ${POEM_TAG_MAX_LENGTH} caracteres`),
		)
		.max(POEM_TAGS_MAX_AMOUNT, `Você pode adicionar no máximo ${POEM_TAGS_MAX_AMOUNT} tags`)
		.optional(),
	status: z.enum(['draft', 'published']),
	visibility: z.enum(['public', 'friends', 'private', 'unlisted']),
	isCommentable: z.boolean(),
	toUserIds: z
		.array(z.number().int().positive('ID de usuário inválido'))
		.max(POEM_TAGS_MAX_AMOUNT, `Você pode dedicar para no máximo ${POEM_TAGS_MAX_AMOUNT} usuários`)
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
	id: z.number('ID inválido').min(1, 'ID deve ser um número positivo'),
});

export const updatePoemSchema = createOrUpdatePoemSchemaBase.extend({
	id: z.number('ID inválido').min(1, 'ID deve ser um número positivo'),
});

export type CreatePoemType = z.infer<typeof createPoemSchema>;
export type DeletePoemType = z.infer<typeof deletePoemSchema>;
export type UpdatePoemType = z.infer<typeof updatePoemSchema>;
