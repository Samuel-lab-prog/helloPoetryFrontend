export type MyProfileViewModel = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	email: string;
	stats: {
		poems: { id: number; title: string }[];
		commentsIds: number[];
		friends: { id: number }[];
	};
};
