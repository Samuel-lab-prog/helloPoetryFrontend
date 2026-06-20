import type { UpdatePoemType } from '../../../schemas/managePoemSchemas';

export const updatePoemData: UpdatePoemType = {
	id: 44,
	title: 'Updated title',
	excerpt: 'Updated summary',
	content: 'This is updated poem content.',
	tags: ['updated'],
	status: 'draft',
	visibility: 'public',
	isCommentable: true,
	toUserIds: [],
};
