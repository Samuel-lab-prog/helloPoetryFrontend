import type { PoemCommentType } from '@features/interactions/public';

export const poemId = 44;
export const authClientId = 123;

export const rootComment: PoemCommentType = {
	id: 100,
	poemId,
	content: 'A visible comment',
	createdAt: '2026-06-20T12:00:00.000Z',
	status: 'visible',
	parentId: null,
	aggregateChildrenCount: 1,
	likesCount: 0,
	likedByCurrentUser: false,
	author: {
		id: authClientId,
		nickname: 'reader',
		avatarUrl: null,
	},
};

export const otherRootComment: PoemCommentType = {
	...rootComment,
	id: 101,
	content: 'Another visible comment',
	aggregateChildrenCount: 0,
	author: {
		id: 456,
		nickname: 'another-reader',
		avatarUrl: null,
	},
};

export const replyComment: PoemCommentType = {
	...rootComment,
	id: 200,
	content: 'A visible reply',
	parentId: rootComment.id,
	aggregateChildrenCount: 0,
	author: {
		id: 456,
		nickname: 'reply-author',
		avatarUrl: null,
	},
};
