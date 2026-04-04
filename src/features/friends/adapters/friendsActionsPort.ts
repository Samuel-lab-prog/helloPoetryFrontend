import type { FriendRequestResult, FriendsActionsPort } from '@core/ports/friends';

import { friends } from '../api/endpoints';
import { friendsKeys } from '../api/keys';

export const friendsActionsPort: FriendsActionsPort = {
	sendFriendRequest: (authorId) =>
		friends.sendFriendRequest.mutate(String(authorId)) as Promise<FriendRequestResult>,
	cancelFriendRequest: async (authorId) => {
		await friends.cancelFriendRequest.mutate(String(authorId));
	},
	acceptFriendRequest: async (requesterId) => {
		await friends.acceptFriendRequest.mutate(String(requesterId));
	},
	rejectFriendRequest: async (requesterId) => {
		await friends.rejectFriendRequest.mutate(String(requesterId));
	},
	getRequestsKey: () => friendsKeys.requests(),
};
