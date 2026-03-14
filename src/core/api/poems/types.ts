export type PoemVisibility = 'public' | 'friends' | 'private' | 'unlisted';
export type PoemStatus = 'draft' | 'published';

export type PoemTag = {
	id: number;
	name: string;
};

export type PoemAuthor = {
	id: number;
	name: string;
	nickname: string;
	avatarUrl: string | null;
};

export type PoemStats = {
	likesCount: number;
	commentsCount: number;
	likedByCurrentUser: boolean;
};

export type FullPoem = {
	tags: PoemTag[];
	title: string;
	slug: string;
	excerpt: string | null;
	id: number;
	createdAt: Date;
	content: string;
	status: PoemStatus;
	visibility: PoemVisibility;
	isCommentable: boolean;
	author: PoemAuthor;
	stats: PoemStats;
	updatedAt: Date;
};

export type PoemPreview = {
	title: string;
	slug: string;
	id: number;
	createdAt?: string | Date;
	likesCount?: number;
	stats?: {
		likesCount?: number;
	};
	tags: PoemTag[];
	author: PoemAuthor;
};

export type PaginatedPoems = {
	nextCursor?: number | null;
	poems: PoemPreview[];
	hasMore: boolean;
};

export type SavedPoem = {
	id: number;
	title: string;
	slug: string;
	savedAt: string;
};

export type PoemCollection = {
	id: number;
	poemIds: number[];
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CreatePoemBody = {
	title: string;
	content: string;
	excerpt: string;
	tags?: string[];
	visibility: PoemVisibility;
	status: PoemStatus;
	isCommentable: boolean;
	toUserIds?: number[];
	mentionedUserIds?: number[];
};

export type UpdatePoemBody = {
	id: string;
	title: string;
	content: string;
	excerpt: string;
	tags?: string[];
	visibility: PoemVisibility;
	status: PoemStatus;
	isCommentable: boolean;
	toUserIds?: number[];
	mentionedUserIds?: number[];
};

export type SearchPoemsParams = {
	limit?: number;
	cursor?: number;
	searchTitle?: string;
	tags?: string[];
	orderBy?: 'createdAt' | 'title';
	orderDirection?: 'asc' | 'desc';
};

export type CreateCollectionBody = {
	userId: string;
	name: string;
	description: string;
};

export type CollectionItemBody = {
	collectionId: string;
	poemId: string;
};

export type CreatePoemResult = {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	tags: PoemTag[];
	content: string;
	visibility: PoemVisibility;
	status: PoemStatus;
	moderationStatus: 'rejected' | 'removed' | 'approved' | 'pending';
	createdAt: Date;
	updatedAt: Date;
	isCommentable: boolean;
	toUserIds: number[];
	mentionedUserIds: number[];
};

export type UpdatePoemResult = {
	id: number;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	tags: PoemTag[];
	visibility: PoemVisibility;
	status: PoemStatus;
	isCommentable: boolean;
	createdAt: Date;
	updatedAt: Date;
	toUserIds: number[];
	mentionedUserIds: number[];
};
