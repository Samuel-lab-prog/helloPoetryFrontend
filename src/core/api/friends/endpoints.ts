import { createHTTPRequest } from '@http-request';
import { createMutationEndpoint, createQueryEndpoint } from '../utils';

import { friendsKeys } from './keys';
import type {
	BlockedUser,
	CancelFriendRequest,
	FriendRecord,
	FriendRequest,
	FriendRequestRejection,
	MyFriendRequests,
	RemovedFriend,
	UnblockUser,
} from './types';

const getMyFriendRequests = createQueryEndpoint<[], MyFriendRequests>({
	key: friendsKeys.requests,

	fn: () =>
		createHTTPRequest<MyFriendRequests>({
			method: 'GET',
			path: `/friends/requests`,
		}),
});

const sendFriendRequest = createMutationEndpoint<string, FriendRequest>({
	fn: (id) =>
		createHTTPRequest<FriendRequest>({
			method: 'POST',
			path: `/friends/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const acceptFriendRequest = createMutationEndpoint<string, FriendRecord | FriendRequest>({
	fn: (id) =>
		createHTTPRequest<FriendRecord | FriendRequest>({
			method: 'PATCH',
			path: `/friends/accept/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const rejectFriendRequest = createMutationEndpoint<string, FriendRequestRejection>({
	fn: (id) =>
		createHTTPRequest<FriendRequestRejection>({
			method: 'PATCH',
			path: `/friends/reject/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const blockUser = createMutationEndpoint<string, BlockedUser>({
	fn: (id) =>
		createHTTPRequest<BlockedUser>({
			method: 'PATCH',
			path: `/friends/block/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const deleteFriend = createMutationEndpoint<string, RemovedFriend>({
	fn: (id) =>
		createHTTPRequest<RemovedFriend>({
			method: 'DELETE',
			path: `/friends/delete/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const cancelFriendRequest = createMutationEndpoint<string, CancelFriendRequest>({
	fn: (id) =>
		createHTTPRequest<CancelFriendRequest>({
			method: 'DELETE',
			path: `/friends/cancel/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

const unblockUser = createMutationEndpoint<string, UnblockUser>({
	fn: (id) =>
		createHTTPRequest<UnblockUser>({
			method: 'PATCH',
			path: `/friends/unblock/${id}`,
		}),

	invalidate: [friendsKeys.requests],
});

export const friends = {
	getMyFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockUser,
	deleteFriend,
	cancelFriendRequest,
	unblockUser,
};

