import type { ModerationAction, ModerationTargetPoem, ModerationTargetUser } from '../types';

type ActionConfig = {
	label: string;
	confirmLabel: string;
	successTitle: string;
	errorTitle: string;
	requiresReason?: boolean;
	requiresDuration?: boolean;
	tone: 'default' | 'danger';
	buildTitle: (targetLabel: string) => string;
	buildDescription: (targetLabel: string) => string;
};

export const moderationActionConfig: Record<ModerationAction, ActionConfig> = {
	'approve-poem': {
		label: 'Approve poem',
		confirmLabel: 'Approve poem',
		successTitle: 'Poem approved',
		errorTitle: 'Could not approve poem',
		tone: 'default',
		buildTitle: (targetLabel) => `Approve ${targetLabel}`,
		buildDescription: () => 'This poem will leave the moderation queue.',
	},
	'reject-poem': {
		label: 'Reject poem',
		confirmLabel: 'Reject poem',
		successTitle: 'Poem rejected',
		errorTitle: 'Could not reject poem',
		requiresReason: true,
		tone: 'danger',
		buildTitle: (targetLabel) => `Reject ${targetLabel}`,
		buildDescription: () => 'The author will be notified with the reason you provide.',
	},
	'remove-poem': {
		label: 'Remove poem',
		confirmLabel: 'Remove poem',
		successTitle: 'Poem removed',
		errorTitle: 'Could not remove poem',
		requiresReason: true,
		tone: 'danger',
		buildTitle: (targetLabel) => `Remove ${targetLabel}`,
		buildDescription: () => 'The poem will no longer be visible to readers.',
	},
	'ban-user': {
		label: 'Ban user',
		confirmLabel: 'Ban user',
		successTitle: 'User banned',
		errorTitle: 'Could not ban user',
		requiresReason: true,
		tone: 'danger',
		buildTitle: (targetLabel) => `Ban ${targetLabel}`,
		buildDescription: () => 'The user will lose access until a moderator reverses the ban.',
	},
	'suspend-user': {
		label: 'Suspend user',
		confirmLabel: 'Suspend user',
		successTitle: 'User suspended',
		errorTitle: 'Could not suspend user',
		requiresReason: true,
		requiresDuration: true,
		tone: 'danger',
		buildTitle: (targetLabel) => `Suspend ${targetLabel}`,
		buildDescription: () => 'The user will lose access for the selected number of days.',
	},
	'unban-user': {
		label: 'Unban user',
		confirmLabel: 'Unban user',
		successTitle: 'User unbanned',
		errorTitle: 'Could not unban user',
		tone: 'default',
		buildTitle: (targetLabel) => `Unban ${targetLabel}`,
		buildDescription: () => 'The active ban will end immediately.',
	},
	'unsuspend-user': {
		label: 'Unsuspend user',
		confirmLabel: 'Unsuspend user',
		successTitle: 'User unsuspended',
		errorTitle: 'Could not unsuspend user',
		tone: 'default',
		buildTitle: (targetLabel) => `Unsuspend ${targetLabel}`,
		buildDescription: () => 'The active suspension will end immediately.',
	},
};

export function getUserTargetLabel(user?: ModerationTargetUser) {
	if (!user) return 'this user';
	return user.nickname ? `@${user.nickname}` : (user.name ?? 'this user');
}

export function getPoemTargetLabel(poem?: ModerationTargetPoem) {
	if (!poem) return 'this poem';
	return poem.title ? `"${poem.title}"` : 'this poem';
}
