export type MyFriendRequestsType = {
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

type QueryOptions<TData> = {
	queryKey: readonly unknown[];
	queryFn: () => Promise<TData>;
};

export type FriendsRequestsPort = {
	getMyFriendRequestsQueryOptions: () => QueryOptions<MyFriendRequestsType>;
};

export type FriendRequestResult = {
	id: number;
	requesterId: number;
	addresseeId: number;
	createdAt: string;
};

export type FriendsActionsPort = {
	sendFriendRequest: (authorId: number) => Promise<FriendRequestResult>;
	cancelFriendRequest: (authorId: number) => Promise<void>;
	acceptFriendRequest: (requesterId: number) => Promise<void>;
	rejectFriendRequest: (requesterId: number) => Promise<void>;
	getRequestsKey: () => readonly unknown[];
};

let friendsRequestsPort: FriendsRequestsPort | null = null;
let friendsActionsPort: FriendsActionsPort | null = null;

export function registerFriendsRequestsPort(port: FriendsRequestsPort) {
	friendsRequestsPort = port;
}

export function getFriendsRequestsPort(): FriendsRequestsPort {
	if (!friendsRequestsPort)
		throw new Error('FriendsRequestsPort not registered. Register it in main.tsx.');
	return friendsRequestsPort;
}

export function registerFriendsActionsPort(port: FriendsActionsPort) {
	friendsActionsPort = port;
}

export function getFriendsActionsPort(): FriendsActionsPort {
	if (!friendsActionsPort)
		throw new Error('FriendsActionsPort not registered. Register it in main.tsx.');
	return friendsActionsPort;
}
