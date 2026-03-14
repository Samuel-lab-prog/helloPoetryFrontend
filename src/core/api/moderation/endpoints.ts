import { createHTTPRequest } from '@root/features/base';
import { createMutationEndpoint } from '../utils';
import type {
	BanUserBody,
	BannedUserResponse,
	SuspendUserBody,
	SuspendedUserResponse,
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

export const moderation = {
	banUser,
	suspendUser,
};
