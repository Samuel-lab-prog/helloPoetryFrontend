import { friends } from '@Api/friends/endpoints';
import { friendsKeys } from '@Api/friends/keys';
import type { FriendsRequestsPort, MyFriendRequestsType } from '@core/ports/friends';

export const friendsRequestsPort: FriendsRequestsPort = {
	getMyFriendRequestsQueryOptions() {
		return {
			queryKey: friendsKeys.requests(),
			queryFn: async () =>
				(await friends.getMyFriendRequests.query().queryFn()) as MyFriendRequestsType,
		};
	},
};
