export type FeedPoem = {
	id: number;
	content: string;
	title: string;
	slug: string;
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
