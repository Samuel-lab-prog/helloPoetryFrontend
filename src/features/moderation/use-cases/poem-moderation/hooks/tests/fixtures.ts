import type { ModerationPoem } from '@Api/moderation/types';

export const pendingPoem: ModerationPoem = {
	id: 44,
	title: 'Pending poem',
	slug: 'pending-poem',
	excerpt: 'Needs review',
	content: 'Poem content',
	audioUrl: null,
	tags: [{ id: 1, name: 'review' }],
	status: 'published',
	visibility: 'public',
	moderationStatus: 'pending',
	isCommentable: true,
	createdAt: '2026-06-20T12:00:00.000Z',
	updatedAt: '2026-06-20T12:00:00.000Z',
	toUsers: [],
	author: {
		id: 77,
		name: 'Poet',
		nickname: 'poet',
		avatarUrl: null,
	},
	stats: {
		likesCount: 0,
		commentsCount: 0,
	},
};
