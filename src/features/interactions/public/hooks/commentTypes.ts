export type PoemCommentType = {
	id: number;
	poemId: number;
	content: string;
	createdAt: string;
	status: 'visible' | 'deletedByAuthor' | 'deletedByModerator';
	parentId: number | null;
	aggregateChildrenCount: number;
	likesCount: number;
	likedByCurrentUser: boolean;
	author: {
		id: number;
		nickname: string;
		avatarUrl: string | null;
		isUnavailable?: boolean;
	};
};

export type CommentPage = {
	comments: PoemCommentType[];
	hasMore: boolean;
	nextCursor?: number;
};

export type InfiniteComments = {
	pages: CommentPage[];
	pageParams: unknown[];
};
