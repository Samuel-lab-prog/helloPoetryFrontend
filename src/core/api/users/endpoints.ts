import { createHTTPRequest } from '@http-request';
import { createMutationEndpoint, createQueryEndpoint } from '../utils';

import { userKeys } from './keys';
import type {
	CreateUserBody,
	UpdateUserBody,
	UsersPage,
	UsersSearchParams,
	PublicUsersSearchParams,
	UserProfile,
	AvatarUploadUrlRequest,
	AvatarUploadUrlResponse,
} from './types';

const checkNickname = createQueryEndpoint<[string], boolean>({
	key: userKeys.checkNickname,

	fn: (nickname) =>
		createHTTPRequest<boolean>({
			method: 'GET',
			path: `/users/check-nickname`,
			query: { nickname },
		}),
});

const checkEmail = createQueryEndpoint<[string], boolean>({
	key: userKeys.checkEmail,

	fn: (email) =>
		createHTTPRequest<boolean>({
			method: 'GET',
			path: `/users/check-email`,
			query: { email },
		}),
});

const getUsers = createQueryEndpoint<[UsersSearchParams], UsersPage>({
	key: userKeys.search,

	fn: (params) =>
		createHTTPRequest<UsersPage>({
			method: 'GET',
			path: `/users`,
			query: params,
		}),
});

const getPublicUsers = createQueryEndpoint<[PublicUsersSearchParams], UsersPage>({
	key: userKeys.publicSearch,

	fn: (params) =>
		createHTTPRequest<UsersPage>({
			method: 'GET',
			path: `/users/public`,
			query: params,
		}),
});

const getProfile = createQueryEndpoint<[string], UserProfile>({
	key: userKeys.profile,

	fn: (id) =>
		createHTTPRequest<UserProfile>({
			method: 'GET',
			path: `/users/${id}/profile`,
		}),
});

const createUser = createMutationEndpoint<CreateUserBody, UserProfile>({
	fn: (data) =>
		createHTTPRequest<UserProfile, CreateUserBody>({
			method: 'POST',
			path: `/users`,
			body: data,
		}),

	invalidate: [userKeys.all],
});

const updateUser = createMutationEndpoint<UpdateUserBody, void>({
	fn: (data) =>
		createHTTPRequest<void, Omit<UpdateUserBody, 'id'>>({
			method: 'PATCH',
			path: `/users/${data.id}`,
			body: {
				name: data.name,
				nickname: data.nickname,
				bio: data.bio,
				avatarUrl: data.avatarUrl,
			},
		}),

	invalidate: [userKeys.all],
});

const requestAvatarUploadUrl = createMutationEndpoint<
	AvatarUploadUrlRequest,
	AvatarUploadUrlResponse
>({
	fn: (data) =>
		createHTTPRequest<AvatarUploadUrlResponse, AvatarUploadUrlRequest>({
			method: 'POST',
			path: `/users/avatar/upload-url`,
			body: data,
		}),
});

export const users = {
	checkNickname,
	checkEmail,
	getUsers,
	getPublicUsers,
	getProfile,
	createUser,
	updateUser,
	requestAvatarUploadUrl,
};

