import { createHTTPRequest } from "@root/features/base";
import {
  createMutationEndpoint,
  createQueryEndpoint
} from "../utils";

import { friendsKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const getMyFriendRequests = createQueryEndpoint({
  key: friendsKeys.requests,

  fn: () =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/friends/requests`,
    }),
});

const sendFriendRequest = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/friends/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const acceptFriendRequest = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/friends/accept/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const rejectFriendRequest = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/friends/reject/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const blockUser = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/friends/block/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const deleteFriend = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/friends/delete/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const cancelFriendRequest = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "DELETE",
      path: `${API_URL}/friends/cancel/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
});

const unblockUser = createMutationEndpoint({
  fn: (id: string) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/friends/unblock/${id}`,
    }),

  invalidate: [
    friendsKeys.requests
  ],
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
