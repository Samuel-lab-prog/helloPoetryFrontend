export type FullPoemType = {
	tags: {
		name: string;
		id: number;
	}[];
	title: string;
	slug: string;
	excerpt: string | null;
	id: number;
	createdAt: Date;
	content: string;
	status: 'draft' | 'published';
	visibility: 'public' | 'friends' | 'private' | 'unlisted';
	isCommentable: boolean;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string | null;
	};
	stats: {
		likesCount: number;
		commentsCount: number;
		likedByCurrentUser: boolean;
	};
	updatedAt: Date;
};

export type TagType = {
	id: number;
	name: string;
};

export type PoemPreviewType = {
	title: string;
	slug: string;
	id: number;
	createdAt?: string | Date;
	tags: {
		id: number;
		name: string;
	}[];
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
	};
};

export type PoemMinimalDataType = {
	id: number;
	title: string;
};

export type PaginatedPoemsType = {
	nextCursor?: number | null;
	poems: PoemPreviewType[];
	hasMore: boolean;
};

export type FeedPoemType = {
	id: number;
	content: string;
	title: string;
	slug: string;
	tags: string[];
	createdAt: string | Date;
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
	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};
	isFriend: boolean;
	hasBlockedRequester: boolean;
	isBlockedByRequester: boolean;
	isFriendRequester: boolean;
};

export type PaginatedMinimalPoemsType = {
	nextCursor?: number | null;
	hasMore: boolean;
	poems: {
		id: number;
		title: string;
	}[];
};
