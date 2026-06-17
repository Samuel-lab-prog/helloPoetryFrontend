import { createMutationEndpoint, createQueryEndpoint } from '@Api/utils';
import { createHTTPRequest } from '@Utils';

import { poemKeys } from '../poems/keys';
import { userKeys } from '../users/keys';
import { moderationKeys } from './keys';
import type {
	BannedUserResponse,
	BanUserBody,
	ModeratePoemBody,
	ModeratePoemResult,
	ModerationPoem,
	SuspendedUserResponse,
	SuspendUserBody,
	UserModerationBody,
	UserSanctionsResponse,
	UserSanctionStatusResponse,
} from './types';

const banUser = createMutationEndpoint<BanUserBody, BannedUserResponse>({
	fn: (data) =>
		createHTTPRequest<BannedUserResponse, { reason: string }>({
			method: 'POST',
			path: `/moderation/ban/${data.userId}`,
			body: {
				reason: data.reason,
			},
		}),
	invalidate: [userKeys.all, moderationKeys.all],
});

const suspendUser = createMutationEndpoint<SuspendUserBody, SuspendedUserResponse>({
	fn: (data) =>
		createHTTPRequest<SuspendedUserResponse, { reason: string; durationDays?: number }>({
			method: 'POST',
			path: `/moderation/suspend/${data.userId}`,
			body: {
				reason: data.reason,
				durationDays: data.durationDays,
			},
		}),
	invalidate: [userKeys.all, moderationKeys.all],
});

const unbanUser = createMutationEndpoint<UserModerationBody, void>({
	fn: (data) =>
		createHTTPRequest<void>({
			method: 'POST',
			path: `/moderation/unban/${data.userId}`,
		}),
	invalidate: [userKeys.all, moderationKeys.all],
});

const unsuspendUser = createMutationEndpoint<UserModerationBody, void>({
	fn: (data) =>
		createHTTPRequest<void>({
			method: 'POST',
			path: `/moderation/unsuspend/${data.userId}`,
		}),
	invalidate: [userKeys.all, moderationKeys.all],
});

const getPendingPoems = createQueryEndpoint<[], ModerationPoem[]>({
	key: moderationKeys.pendingPoems,
	fn: () =>
		createHTTPRequest<ModerationPoem[]>({
			method: 'GET',
			path: `/poems/moderation/pending`,
		}),
});

const moderatePoem = createMutationEndpoint<ModeratePoemBody, ModeratePoemResult>({
	fn: (data) =>
		createHTTPRequest<
			ModeratePoemResult,
			{
				moderationStatus: ModeratePoemBody['moderationStatus'];
				reason?: string;
			}
		>({
			method: 'PATCH',
			path: `/moderation/poems/${data.poemId}`,
			body: {
				moderationStatus: data.moderationStatus,
				reason: data.reason?.trim() || undefined,
			},
		}),
	invalidate: [moderationKeys.pendingPoems, poemKeys.mine],
});

const getUserSanctions = createQueryEndpoint<[string], UserSanctionsResponse>({
	key: moderationKeys.userSanctions,
	fn: (userId) =>
		createHTTPRequest<UserSanctionsResponse>({
			method: 'GET',
			path: `/moderation/users/${userId}/sanctions`,
		}),
});

const getUserSanctionStatus = createQueryEndpoint<[string], UserSanctionStatusResponse>({
	key: moderationKeys.userSanctionStatus,
	fn: (userId) =>
		createHTTPRequest<UserSanctionStatusResponse>({
			method: 'GET',
			path: `/moderation/users/${userId}/sanctions/active`,
		}),
});

export const moderation = {
	banUser,
	suspendUser,
	unbanUser,
	unsuspendUser,
	getPendingPoems,
	moderatePoem,
	getUserSanctions,
	getUserSanctionStatus,
};
