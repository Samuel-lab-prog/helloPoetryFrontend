import type { ModerationPoem } from '@root/core/api/moderation/types';

export function translateVisibility(visibility: ModerationPoem['visibility']) {
	switch (visibility) {
		case 'public':
			return 'Public';
		case 'private':
			return 'Private';
		case 'unlisted':
			return 'Unlisted';
		default:
			return visibility;
	}
}

export function translateModerationStatus(status: ModerationPoem['moderationStatus']) {
	switch (status) {
		case 'approved':
			return 'Approved';
		case 'rejected':
			return 'Rejected';
		case 'pending':
			return 'Pending';
		case 'removed':
			return 'Removed';
		default:
			return status;
	}
}
