import type { CreatePoemResult } from '@Api/poems/types';

import type { CreatePoemType } from '../../../manage-poem/schemas/managePoemSchemas';

export const createPoemData: CreatePoemType = {
	title: 'Clean title',
	excerpt: 'Short summary',
	content: 'This is clean poem content.',
	tags: ['clean'],
	status: 'draft',
	visibility: 'public',
	isCommentable: true,
	toUserIds: [],
	audio: null,
};

export const createdPoem: CreatePoemResult = {
	id: 44,
	title: 'Clean title',
	slug: 'clean-title',
	excerpt: 'Short summary',
	tags: [{ id: 1, name: 'clean' }],
	content: 'This is clean poem content.',
	visibility: 'public',
	status: 'draft',
	moderationStatus: 'approved',
	createdAt: new Date('2026-06-20T12:00:00.000Z'),
	updatedAt: new Date('2026-06-20T12:00:00.000Z'),
	isCommentable: true,
	audioUrl: null,
	toUserIds: [],
	mentionedUserIds: [],
};
