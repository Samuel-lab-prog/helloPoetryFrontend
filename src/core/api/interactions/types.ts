export type PoemComment = {
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
	};
};

export type PoemCommentsPage = {
	comments: PoemComment[];
	hasMore: boolean;
	nextCursor?: number;
};

export type GetPoemCommentsParams = {
	parentId?: string;
	cursor?: number;
	limit?: number;
};

export type CommentPoemBody = {
	poemId: number;
	content: string;
	parentId?: number;
};

export type UpdateCommentBody = {
	commentId: string;
	content: string;
};
