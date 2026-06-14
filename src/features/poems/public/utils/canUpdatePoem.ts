type EditablePoemState = {
	status: string;
	moderationStatus?: string | null;
};

export function canUpdatePoem(poem?: EditablePoemState | null) {
	if (!poem) return false;
	if (poem.moderationStatus === 'removed') return false;
	if (poem.status === 'published' && poem.moderationStatus !== 'rejected') return false;
	return true;
}
