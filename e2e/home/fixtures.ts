export const publicHomePoem = {
	id: 601,
	title: 'Logged Out Home Poem',
	slug: 'logged-out-home-poem',
	excerpt: 'A public poem visible on the logged-out home feed.',
	createdAt: '2026-06-19T12:00:00.000Z',
	status: 'published',
	moderationStatus: 'approved',
	likesCount: 12,
	commentsCount: 3,
	stats: {
		likesCount: 12,
		commentsCount: 3,
	},
	tags: [
		{
			id: 1,
			name: 'public',
		},
	],
	author: {
		id: 602,
		name: 'Public Home Poet',
		nickname: 'public-home-poet',
		avatarUrl: null,
		status: 'active',
	},
};

export const publicHomePoemsPage = {
	poems: [publicHomePoem],
	hasMore: false,
	nextCursor: null,
};
