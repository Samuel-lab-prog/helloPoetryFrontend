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

export type CommentPoemBody = {
	poemId: string;
	content: string;
	parentId?: string;
};

export type UpdateCommentBody = {
	commentId: string;
	content: string;
};
