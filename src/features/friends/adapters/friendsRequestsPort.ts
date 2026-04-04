import type { FriendsRequestsPort, MyFriendRequestsType } from '@core/ports/friends';

import { friends } from '../api/endpoints';
import { friendsKeys } from '../api/keys';

export const friendsRequestsPort: FriendsRequestsPort = {
	getMyFriendRequestsQueryOptions() {
		return {
			queryKey: friendsKeys.requests(),
			queryFn: async () =>
				(await friends.getMyFriendRequests.query().queryFn()) as MyFriendRequestsType,
		};
	},
};
