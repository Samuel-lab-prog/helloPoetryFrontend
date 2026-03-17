export type FriendRequest = {
	id: number;
	requesterId: number;
	addresseeId: number;
	createdAt: string;
};

export type FriendRecord = {
	id: number;
	userAId: number;
	userBId: number;
	createdAt: string;
};

export type FriendRequestRejection = {
	rejectedId: number;
	rejecterId: number;
};

export type CancelFriendRequest = {
	cancellerId: number;
	cancelledId: number;
};

export type RemovedFriend = {
	removedById: number;
	removedId: number;
};

export type BlockedUser = {
	id: number;
	blockedById: number;
	blockedUserId: number;
	createdAt: string;
};

export type UnblockUser = {
	unblockerId: number;
	unblockedId: number;
};

export type MyFriendRequests = {
	sent: {
		addresseeId: number;
		addresseeName: string;
		addresseeNickname: string;
		addresseeAvatarUrl: string | null;
	}[];
	received: {
		requesterId: number;
		requesterName: string;
		requesterNickname: string;
		requesterAvatarUrl: string | null;
	}[];
};

