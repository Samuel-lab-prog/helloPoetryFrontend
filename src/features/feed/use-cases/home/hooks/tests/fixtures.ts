import type { FeedPoem } from '@Api/feed/types';
import type { PoemPreviewType } from '@features/poems/public/types';

export const recentPoem: PoemPreviewType = {
	id: 1,
	title: 'Recent poem',
	slug: 'recent-poem',
	excerpt: 'Recent excerpt',
	createdAt: '2026-06-20T12:00:00.000Z',
	likesCount: 2,
	commentsCount: 1,
	tags: [{ id: 1, name: 'recent' }],
	author: {
		id: 10,
		name: 'Recent Author',
		nickname: 'recent-author',
		avatarUrl: null,
	},
};

export const feedPoem: FeedPoem = {
	id: 2,
	title: 'Personalized poem',
	slug: 'personalized-poem',
	content: 'Full personalized poem content',
	excerpt: 'Personalized excerpt',
	createdAt: '2026-06-20T12:30:00.000Z',
	likesCount: 4,
	commentsCount: 3,
	tags: ['personal', 'feed'],
	author: {
		id: 20,
		name: 'Feed Author',
		nickname: 'feed-author',
		avatarUrl: 'https://example.com/avatar.png',
	},
};
