import { createHTTPRequest } from "@root/features/base";
import {
  createMutationEndpoint,
  createQueryEndpoint
} from "../utils";

import { userKeys } from "./keys";

const API_URL = import.meta.env.VITE_API_URL;

const checkNickname = createQueryEndpoint({
  key: userKeys.checkNickname,

  fn: (nickname: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/users/check-nickname`,
      query: { nickname },
    }),
});

const checkEmail = createQueryEndpoint({
  key: userKeys.checkEmail,

  fn: (email: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/users/check-email`,
      query: { email },
    }),
});

const getUsers = createQueryEndpoint({
  key: userKeys.search,

  fn: (params: {
    limit?: number;
    cursor?: string;
    orderBy: "nickname" | "createdAt" | "id";
    orderDirection: "asc" | "desc";
    searchNickname?: string;
  }) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/users`,
      query: params,
    }),
});

const getProfile = createQueryEndpoint({
  key: userKeys.profile,

  fn: (id: string) =>
    createHTTPRequest({
      method: "GET",
      path: `${API_URL}/users/${id}/profile`,
    }),
});

const createUser = createMutationEndpoint({
  fn: (data: {
    name: string;
    nickname: string;
    email: string;
    password: string;
    bio: string;
    avatarUrl: string;
  }) =>
    createHTTPRequest({
      method: "POST",
      path: `${API_URL}/users`,
      body: data,
    }),

  invalidate: [
    userKeys.all
  ],
});

const updateUser = createMutationEndpoint({
  fn: (data: {
    id: string;
    name?: string;
    nickname?: string;
    bio?: string;
    avatarUrl?: string;
  }) =>
    createHTTPRequest({
      method: "PATCH",
      path: `${API_URL}/users/${data.id}`,
      body: {
        name: data.name,
        nickname: data.nickname,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      },
    }),

  invalidate: [
    userKeys.all
  ],
});

export const users = {
  checkNickname,
  checkEmail,
  getUsers,
  getProfile,
  createUser,
  updateUser,
};
