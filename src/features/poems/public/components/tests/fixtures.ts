import type { PoemPreviewType } from '../../types';

export const poemPreview: PoemPreviewType = {
	id: 44,
	title: 'A river remembers',
	slug: 'a-river-remembers',
	excerpt: 'A short poem about memory and water.',
	createdAt: '2026-06-20T12:00:00.000Z',
	status: 'published',
	moderationStatus: 'approved',
	likesCount: 2,
	commentsCount: 1,
	stats: {
		likesCount: 7,
		commentsCount: 3,
	},
	tags: [
		{ id: 1, name: 'memory' },
		{ id: 2, name: 'water' },
		{ id: 3, name: 'quiet' },
		{ id: 4, name: 'night' },
		{ id: 5, name: 'hidden' },
	],
	author: {
		id: 12,
		name: 'Ada River',
		nickname: 'adariver',
		avatarUrl: null,
	},
};

export const poemPreviewWithoutStats: PoemPreviewType = {
	...poemPreview,
	id: 45,
	title: 'Fallback counts',
	slug: 'fallback-counts',
	stats: undefined,
	likesCount: 4,
	commentsCount: 9,
	tags: [],
};
