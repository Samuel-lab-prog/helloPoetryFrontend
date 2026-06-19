export const publicPoem = {
	id: 101,
	title: 'Logged Out Test Poem',
	slug: 'logged-out-test-poem',
	excerpt: 'A public poem used by access-control tests.',
	content: 'A public poem body that should remain readable without signing in.',
	audioUrl: null,
	status: 'published',
	visibility: 'public',
	moderationStatus: 'approved',
	rejectionReason: null,
	isCommentable: true,
	createdAt: '2026-06-19T12:00:00.000Z',
	updatedAt: '2026-06-19T12:00:00.000Z',
	tags: [
		{
			id: 1,
			name: 'public',
		},
	],
	author: {
		id: 11,
		name: 'Public Author',
		nickname: 'public-author',
		avatarUrl: null,
		status: 'active',
	},
	stats: {
		likesCount: 7,
		commentsCount: 2,
		likedByCurrentUser: false,
	},
};

export const publicPoemCommentsPage = {
	comments: [
		{
			id: 201,
			poemId: publicPoem.id,
			content: 'This public comment may be read by logged out visitors.',
			createdAt: '2026-06-19T12:01:00.000Z',
			status: 'visible',
			parentId: null,
			aggregateChildrenCount: 1,
			likesCount: 0,
			likedByCurrentUser: false,
			author: {
				id: 21,
				nickname: 'reader-one',
				avatarUrl: null,
			},
		},
	],
	hasMore: false,
	nextCursor: undefined,
};

export const publicPoemRepliesPage = {
	comments: [
		{
			id: 202,
			poemId: publicPoem.id,
			content: 'A visible reply should still be read-only for logged out visitors.',
			createdAt: '2026-06-19T12:02:00.000Z',
			status: 'visible',
			parentId: 201,
			aggregateChildrenCount: 0,
			likesCount: 0,
			likedByCurrentUser: false,
			author: {
				id: 22,
				nickname: 'reader-two',
				avatarUrl: null,
			},
		},
	],
	hasMore: false,
	nextCursor: undefined,
};
