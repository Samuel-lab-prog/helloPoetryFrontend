export type FeedPoem = {
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
