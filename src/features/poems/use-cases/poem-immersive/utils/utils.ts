import { useMemo } from 'react';

import { type DedicationUser, type Poem } from './types';

export function parsePoemId(rawId: string | undefined) {
	if (!rawId) return -1;
	const parsed = Number(rawId);
	if (!Number.isFinite(parsed) || parsed <= 0) return -1;
	return parsed;
}

export function useDedicationUsers(poem?: Poem | null): DedicationUser[] {
	return useMemo(() => {
		if (!poem?.toUsers?.length) return [];
		return poem.toUsers.filter((user) => Number.isInteger(user.id));
	}, [poem?.toUsers]);
}
