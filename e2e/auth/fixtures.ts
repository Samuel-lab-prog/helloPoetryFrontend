export const signedInSessionProfile = {
	id: 801,
	name: 'Signed Out Cache Reader',
	nickname: 'signed-out-cache-reader',
	bio: 'Private profile data that must disappear after signing out.',
	avatarUrl: null,
	role: 'author',
	status: 'active',
	email: 'signed-out-cache-reader@example.com',
	emailVerifiedAt: '2026-06-19T12:00:00.000Z',
	unreadNotificationsCount: 2,
	poems: [],
	stats: {
		poems: [{ id: 802, title: 'Private Cached Draft' }],
		commentsIds: [],
		friends: [],
	},
	blockedUsersIds: [],
};

export const signedInSessionPoem = {
	id: 802,
	title: 'Private Cached Draft',
	slug: 'private-cached-draft',
	excerpt: 'Private poem data that should not remain visible after logout.',
	content: 'Private poem body.',
	audioUrl: null,
	status: 'draft',
	visibility: 'private',
	moderationStatus: 'approved',
	rejectionReason: null,
	isCommentable: true,
	createdAt: '2026-06-19T12:00:00.000Z',
	updatedAt: '2026-06-19T12:00:00.000Z',
	tags: [
		{
			id: 1,
			name: 'private',
		},
	],
	author: {
		id: signedInSessionProfile.id,
		name: signedInSessionProfile.name,
		nickname: signedInSessionProfile.nickname,
		avatarUrl: null,
		status: 'active',
	},
	stats: {
		likesCount: 0,
		commentsCount: 0,
		likedByCurrentUser: false,
	},
};
