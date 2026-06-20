import type { ModerationActionInput, ModerationTargetPoem } from '../../types';

export const targetUser = {
	id: 77,
	name: 'Target User',
	nickname: 'target',
	role: 'author',
	status: 'active',
	avatarUrl: null,
};

export const targetPoem: ModerationTargetPoem = {
	id: 44,
	title: 'Pending poem',
	status: 'published',
	moderationStatus: 'pending',
	author: targetUser,
};

export const banInput: ModerationActionInput = {
	action: 'ban-user',
	user: targetUser,
	reason: '  repeated abuse  ',
};

export const approvePoemInput: ModerationActionInput = {
	action: 'approve-poem',
	poem: targetPoem,
};
