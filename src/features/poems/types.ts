import type { FullPoem as FullPoemType } from '@root/core/api/poems/types';

export type {
	FullPoem as FullPoemType,
	PaginatedPoems as PaginatedPoemsType,
	PoemAuthor as PoemAuthorType,
	PoemCollection as PoemCollectionType,
	PoemPreview as PoemPreviewType,
	PoemStatus,
	PoemVisibility,
	SavedPoem as SavedPoemType,
	PoemTag as TagType,
} from '@root/core/api/poems/types';

export type PoemMinimalDataType = Pick<FullPoemType, 'id' | 'title'>;

export type FeedPoemType = {
	id: number;
	content: string;
	title: string;
	slug: string;
	excerpt?: string | null;
	tags: string[];
	createdAt: string | Date;
	likesCount: number;
	commentsCount: number;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
	};
};

export type AuthorProfileType = {
	id: number;
	nickname: string;
	name: string;
	bio: string | null;
	avatarUrl: string | null;
	role: string;
	status: string;
	poems: PoemPreviewType[];
	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};
	isFriend: boolean;
	hasBlockedRequester: boolean;
	isBlockedByRequester: boolean;
	isFriendRequester: boolean;
	hasIncomingFriendRequest: boolean;
};

export type PaginatedMinimalPoemsType = {
	nextCursor?: number | null;
	hasMore: boolean;
	poems: {
		id: number;
		title: string;
	}[];
};
