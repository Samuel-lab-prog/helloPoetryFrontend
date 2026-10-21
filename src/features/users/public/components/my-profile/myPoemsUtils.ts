import type { FullPoemType } from '@features/poems/public/types';

export type MyPoemsStatusFilter = 'all' | 'draft' | 'published';

export function sortDraftsByUpdatedAt(poems: FullPoemType[]) {
	return [...poems].sort(
		(first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
	);
}

export function filterAndSortMyPoems(
	poems: FullPoemType[],
	status: MyPoemsStatusFilter,
	searchTitle: string,
) {
	const normalizedSearch = searchTitle.trim().toLocaleLowerCase();
	const filtered = poems.filter((poem) => {
		const matchesStatus = status === 'all' || poem.status === status;
		const matchesTitle =
			!normalizedSearch || poem.title.toLocaleLowerCase().includes(normalizedSearch);
		return matchesStatus && matchesTitle;
	});

	return status === 'draft' ? sortDraftsByUpdatedAt(filtered) : filtered;
}

export function prioritizeRecentDrafts(poems: FullPoemType[], limit: number) {
	const drafts = sortDraftsByUpdatedAt(poems.filter((poem) => poem.status === 'draft'));
	const draftIds = new Set(drafts.map((poem) => poem.id));
	return [...drafts, ...poems.filter((poem) => !draftIds.has(poem.id))].slice(0, limit);
}
