import { interactionsKeys } from '@Api/interactions/keys';
import type { FullPoem } from '@Api/poems/types';
import type { AuthorProfileType } from '@root/features/poems/public/types';
import type { QueryClient } from '@tanstack/react-query';

import type { PoemCommentType } from '../usePoemComments';

export type CommentPage = {
	comments: PoemCommentType[];
	hasMore: boolean;
	nextCursor?: number;
};

export type InfiniteComments = {
	pages: CommentPage[];
	pageParams: unknown[];
};

export const poemId = 44;
export const authScope = 'user:123:active';

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
		id: 12,
		nickname: 'reader',
		avatarUrl: null,
	},
};

export const replyComment: PoemCommentType = {
	...rootComment,
	id: 101,
	content: 'A visible reply',
	parentId: rootComment.id,
	aggregateChildrenCount: 0,
};

export function commentPage(comments: PoemCommentType[]): CommentPage {
	return {
		comments,
		hasMore: false,
	};
}

export function getRootCommentsKey() {
	return interactionsKeys.commentsByPoem(String(poemId), { authScope });
}

export function seedRootComments(
	queryClient: QueryClient,
	comments: PoemCommentType[] = [rootComment],
) {
	queryClient.setQueryData<InfiniteComments>(getRootCommentsKey(), {
		pages: [commentPage(comments)],
		pageParams: [undefined],
	});
}

export const likedPoemId = 55;
export const requesterId = 77;
export const authorId = 88;

export const fullPoem: FullPoem = {
	id: likedPoemId,
	title: 'A cached poem',
	slug: 'a-cached-poem',
	excerpt: 'Cached excerpt',
	content: 'Cached content',
	audioUrl: null,
	status: 'published',
	visibility: 'public',
	moderationStatus: 'approved',
	isCommentable: true,
	createdAt: new Date('2026-06-20T12:00:00.000Z'),
	updatedAt: new Date('2026-06-20T12:00:00.000Z'),
	tags: [{ id: 1, name: 'cache' }],
	author: {
		id: 1,
		name: 'Poet',
		nickname: 'poet',
		avatarUrl: null,
	},
	stats: {
		likesCount: 3,
		commentsCount: 1,
		likedByCurrentUser: false,
	},
};

export const authorProfile: AuthorProfileType = {
	id: authorId,
	nickname: 'author',
	name: 'Author',
	bio: null,
	avatarUrl: null,
	role: 'author',
	status: 'active',
	poems: [],
	stats: {
		poemsCount: 1,
		commentsCount: 0,
		friendsCount: 0,
	},
	isFriend: false,
	hasBlockedRequester: false,
	isBlockedByRequester: false,
	isFriendRequester: false,
	hasIncomingFriendRequest: true,
};

export function getPoemKey(id: number | string) {
	return ['poem', String(id)] as const;
}

export function getProfileKey(id: number | string) {
	return ['users', 'profile', String(id)] as const;
}

export function getRequestsKey() {
	return ['friends', 'requests'] as const;
}

export function seedPoem(queryClient: QueryClient, poem: FullPoem = fullPoem) {
	queryClient.setQueryData(getPoemKey(poem.id), poem);
}

export function seedAuthorProfile(
	queryClient: QueryClient,
	profile: typeof authorProfile = authorProfile,
) {
	queryClient.setQueryData(getProfileKey(profile.id), profile);
}
