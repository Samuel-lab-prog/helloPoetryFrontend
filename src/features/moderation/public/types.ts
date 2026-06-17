import type { ModeratePoemBody } from '@Api/moderation/types';
import type { PoemStatus } from '@Api/poems/types';
import type { UserRole, UserStatus } from '@Api/users/types';

export type ModerationAction =
	| 'approve-poem'
	| 'reject-poem'
	| 'remove-poem'
	| 'ban-user'
	| 'suspend-user'
	| 'unban-user'
	| 'unsuspend-user';

export type ModerationTargetUser = {
	id: number;
	name?: string;
	nickname: string;
	role?: UserRole | string;
	status?: UserStatus | string;
	avatarUrl?: string | null;
};

export type ModerationTargetPoem = {
	id: number;
	title: string;
	status?: PoemStatus;
	moderationStatus?: ModeratePoemBody['moderationStatus'] | 'pending';
	author?: ModerationTargetUser;
};

export type ModerationActionInput = {
	action: ModerationAction;
	poem?: ModerationTargetPoem;
	user?: ModerationTargetUser;
	reason?: string;
	durationDays?: number;
};

export type ModerationActionCompletePayload = Pick<
	ModerationActionInput,
	'action' | 'poem' | 'user'
>;
