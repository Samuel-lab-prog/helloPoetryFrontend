import type { AuthClient } from '@Api/auth/types';
import type { UserSanctionStatusResponse } from '@Api/moderation/types';

import type { ModerationTargetPoem, ModerationTargetUser } from '../../types';

export const moderatorClient: AuthClient = {
	id: 10,
	role: 'moderator',
	status: 'active',
};

export const adminClient: AuthClient = {
	id: 11,
	role: 'admin',
	status: 'active',
};

export const authorClient: AuthClient = {
	id: 12,
	role: 'author',
	status: 'active',
};

export const targetAuthor: ModerationTargetUser = {
	id: 77,
	name: 'Target Author',
	nickname: 'targetauthor',
	role: 'author',
	status: 'active',
	avatarUrl: null,
};

export const targetModerator: ModerationTargetUser = {
	...targetAuthor,
	id: 78,
	nickname: 'targetmoderator',
	role: 'moderator',
};

export const targetAdmin: ModerationTargetUser = {
	...targetAuthor,
	id: 79,
	nickname: 'targetadmin',
	role: 'admin',
};

export const pendingPoem: ModerationTargetPoem = {
	id: 44,
	title: 'Pending poem',
	status: 'published',
	moderationStatus: 'pending',
};

export const rejectedPoem: ModerationTargetPoem = {
	...pendingPoem,
	id: 45,
	title: 'Rejected poem',
	moderationStatus: 'rejected',
};

export const removedPoem: ModerationTargetPoem = {
	...pendingPoem,
	id: 46,
	title: 'Removed poem',
	moderationStatus: 'removed',
};

export const noActiveSanctions: UserSanctionStatusResponse = {
	activeBan: null,
	activeSuspension: null,
};
