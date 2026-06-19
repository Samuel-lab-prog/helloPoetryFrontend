export const publicAuthor = {
	id: 301,
	name: 'Logged Out Poet',
	nickname: 'logged-out-poet',
	bio: 'A public poet profile used by logged-out access tests.',
	avatarUrl: null,
	role: 'author',
	status: 'active',
	stats: {
		poemsCount: 1,
		commentsCount: 4,
		friendsCount: 2,
	},
	isFriend: false,
	hasBlockedRequester: false,
	isBlockedByRequester: false,
	isFriendRequester: false,
	hasIncomingFriendRequest: false,
	poems: [
		{
			id: 401,
			title: 'Logged Out Author Poem',
			slug: 'logged-out-author-poem',
			excerpt: 'A public poem that should be visible on a public poet profile.',
			createdAt: '2026-06-19T12:00:00.000Z',
			status: 'published',
			moderationStatus: 'approved',
			likesCount: 3,
			commentsCount: 1,
			stats: {
				likesCount: 3,
				commentsCount: 1,
			},
			tags: [
				{
					id: 1,
					name: 'public',
				},
			],
			author: {
				id: 301,
				name: 'Logged Out Poet',
				nickname: 'logged-out-poet',
				avatarUrl: null,
				status: 'active',
			},
		},
	],
};

export const loggedInFriendAuthor = {
	...publicAuthor,
	isFriend: true,
};

export const privateProfile = {
	id: 501,
	name: 'Logged In Reader',
	nickname: 'logged-in-reader',
	bio: 'A signed-in reader used by cache regression tests.',
	avatarUrl: null,
	role: 'author',
	status: 'active',
	email: 'reader@example.com',
	emailVerifiedAt: '2026-06-19T12:00:00.000Z',
	unreadNotificationsCount: 0,
	poems: [],
	stats: {
		poems: [],
		commentsIds: [],
		friends: [],
	},
	blockedUsersIds: [],
};
