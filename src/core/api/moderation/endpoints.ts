import { createHTTPRequest } from '@http-request';
import { createMutationEndpoint, createQueryEndpoint } from '../utils';
import type {
	BanUserBody,
	BannedUserResponse,
	SuspendUserBody,
	SuspendedUserResponse,
	ModerationPoem,
	ModeratePoemBody,
	ModeratePoemResult,
} from './types';
import { moderationKeys } from './keys';

const banUser = createMutationEndpoint<BanUserBody, BannedUserResponse>({
	fn: (data) =>
		createHTTPRequest<BannedUserResponse, { reason: string }>({
			method: 'POST',
			path: `/moderation/ban/${data.userId}`,
			body: {
				reason: data.reason,
			},
		}),
});

const suspendUser = createMutationEndpoint<SuspendUserBody, SuspendedUserResponse>({
	fn: (data) =>
		createHTTPRequest<SuspendedUserResponse, { reason: string }>({
			method: 'POST',
			path: `/moderation/suspend/${data.userId}`,
			body: {
				reason: data.reason,
			},
		}),
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
		createHTTPRequest<ModeratePoemResult, { moderationStatus: ModeratePoemBody['moderationStatus'] }>({
			method: 'PATCH',
			path: `/poems/${data.poemId}/moderation`,
			body: {
				moderationStatus: data.moderationStatus,
			},
		}),
	invalidate: [moderationKeys.pendingPoems],
});

export const moderation = {
	banUser,
	suspendUser,
	getPendingPoems,
	moderatePoem,
};

