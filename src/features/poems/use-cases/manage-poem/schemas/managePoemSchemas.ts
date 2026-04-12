import { z } from 'zod';

import {
	POEM_CONTENT_MAX_LENGTH,
	POEM_CONTENT_MIN_LENGTH,
	POEM_EXCERPT_MAX_LENGTH,
	POEM_EXCERPT_MIN_LENGTH,
	POEM_TAG_MAX_LENGTH,
	POEM_TAGS_MAX_AMOUNT,
	POEM_TITLE_MAX_LENGTH,
	POEM_TITLE_MIN_LENGTH,
} from '../../create-poem/components/constants';

const createOrUpdatePoemSchemaBase = z.object({
	title: z
		.string()
		.min(POEM_TITLE_MIN_LENGTH, `Title must be at least ${POEM_TITLE_MIN_LENGTH} characters`)
		.max(POEM_TITLE_MAX_LENGTH, `Title must be at most ${POEM_TITLE_MAX_LENGTH} characters`),
	excerpt: z
		.string()
		.min(POEM_EXCERPT_MIN_LENGTH, `Summary must be at least ${POEM_EXCERPT_MIN_LENGTH} characters`)
		.max(POEM_EXCERPT_MAX_LENGTH, `Summary must be at most ${POEM_EXCERPT_MAX_LENGTH} characters`),
	content: z
		.string()
		.min(POEM_CONTENT_MIN_LENGTH, `Content must be at least ${POEM_CONTENT_MIN_LENGTH} characters`)
		.max(POEM_CONTENT_MAX_LENGTH, `Content must be at most ${POEM_CONTENT_MAX_LENGTH} characters`),
	tags: z
		.array(
			z
				.string()
				.min(1, 'Invalid tag')
				.max(POEM_TAG_MAX_LENGTH, `Tag must be at most ${POEM_TAG_MAX_LENGTH} characters`),
		)
		.max(POEM_TAGS_MAX_AMOUNT, `You can add at most ${POEM_TAGS_MAX_AMOUNT} tags`)
		.optional(),
	status: z.enum(['draft', 'published']),
	visibility: z.enum(['public', 'friends', 'private', 'unlisted']),
	isCommentable: z.boolean(),
	toUserIds: z
		.array(z.number().int().positive('Invalid user ID'))
		.max(POEM_TAGS_MAX_AMOUNT, `You can dedicate to at most ${POEM_TAGS_MAX_AMOUNT} users`)
		.optional(),
});

export const createPoemSchema = createOrUpdatePoemSchemaBase.extend({
	audio: z.any().optional().nullable(),
});

export const deletePoemSchema = z.object({
	id: z.number('Invalid ID').min(1, 'ID must be a positive number'),
});

export const updatePoemSchema = createOrUpdatePoemSchemaBase.extend({
	id: z.number('Invalid ID').min(1, 'ID must be a positive number'),
});

export type CreatePoemType = z.infer<typeof createPoemSchema>;
export type DeletePoemType = z.infer<typeof deletePoemSchema>;
export type UpdatePoemType = z.infer<typeof updatePoemSchema>;
