import type { AuthClient } from '@Api/auth/types';

import type { ModerationTargetUser } from '../types';

type ModerationRequester = Pick<AuthClient, 'id' | 'role' | 'status'> | null | undefined;

export function canUseModerationTools(requester: ModerationRequester) {
	return (
		requester?.status === 'active' && (requester.role === 'admin' || requester.role === 'moderator')
	);
}

export function canModeratePoemTarget(requester: ModerationRequester) {
	return canUseModerationTools(requester);
}

export function canModerateUserTarget(
	requester: ModerationRequester,
	target: ModerationTargetUser | null | undefined,
) {
	if (!target || !canUseModerationTools(requester)) return false;
	if (requester?.id === target.id) return false;
	if (target.role === 'admin') return false;
	if (target.role === 'moderator' && requester?.role !== 'admin') return false;
	return true;
}
