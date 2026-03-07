export type FullPostType = {
	tags: {
		name: string;
		id: number;
	}[];
	title: string;
	slug: string;
	excerpt: string;
	id: number;
	createdAt: Date;
	content: string;
	status: 'draft' | 'published';
	updatedAt: Date;
};

export type TagType = {
	id: number;
	name: string;
};

export type PostPreviewType = {
	tags: {
		name: string;
		id: number;
	}[];
	title: string;
	slug: string;
	excerpt: string;
	id: number;
	createdAt: Date;
};

export type PostMinimalDataType = {
	id: number;
	title: string;
};

export type PaginatedPostsType = {
	nextCursor?: number | undefined;
	posts: PostPreviewType[];
	hasMore: boolean;
};

export type PaginatedMinimalPostsType = {
	nextCursor?: number | undefined;
	hasMore: boolean;
	posts: {
		id: number;
		title: string;
	}[];
};
