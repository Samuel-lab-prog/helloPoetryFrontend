export type UsersSearchParams = {
	limit?: number;
	cursor?: string;
	orderBy: 'nickname' | 'createdAt' | 'id';
	orderDirection: 'asc' | 'desc';
	searchNickname?: string;
};

export type PublicUsersSearchParams = {
	limit?: number;
	searchNickname?: string;
};

export type UserPreview = {
	id: number;
	nickname: string;
	avatarUrl: string | null;
	role: string;
};

export type UsersPage = {
	users: UserPreview[];
	nextCursor?: number;
	hasMore: boolean;
};

export type UserPublicProfile = {
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
	hasIncomingFriendRequest: boolean;
};

export type UserPrivateProfile = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: string;
	status: string;
	email: string;
	emailVerifiedAt: string | null;
	unreadNotificationsCount: number;
	stats: {
		poems: { id: number; title: string }[];
		commentsIds: number[];
		friends: { id: number }[];
	};
	blockedUsersIds: number[];
};

export type UserProfile = UserPublicProfile | UserPrivateProfile;

export type CreateUserBody = {
	name: string;
	nickname: string;
	email: string;
	password: string;
	bio: string;
	avatarUrl?: string;
};

export type UpdateUserBody = {
	id: string;
	name?: string;
	nickname?: string;
	bio?: string;
	avatarUrl?: string;
};

export type AvatarUploadUrlRequest = {
	contentType: string;
	contentLength?: number;
};

export type AvatarUploadUrlResponse = {
	uploadUrl: string;
	fields: Record<string, string>;
	fileUrl: string;
};

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'banned' | 'suspended';
