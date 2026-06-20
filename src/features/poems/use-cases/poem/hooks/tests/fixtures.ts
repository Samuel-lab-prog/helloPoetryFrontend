import type { FullPoem } from '@Api/poems/types';

export const fullPoem: FullPoem = {
	id: 44,
	title: 'Visible poem',
	slug: 'visible-poem',
	excerpt: 'A visible poem',
	content: 'This poem can be read.',
	audioUrl: null,
	status: 'published',
	visibility: 'public',
	moderationStatus: 'approved',
	isCommentable: true,
	createdAt: new Date('2026-06-20T12:00:00.000Z'),
	updatedAt: new Date('2026-06-20T12:00:00.000Z'),
	tags: [],
	author: {
		id: 123,
		name: 'Poet',
		nickname: 'poet',
		avatarUrl: null,
	},
	stats: {
		likesCount: 0,
		commentsCount: 0,
		likedByCurrentUser: false,
	},
};
