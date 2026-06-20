import { poemKeys } from '@Api/poems/keys';
import type { FullPoem, PoemCollection, SavedPoem } from '@Api/poems/types';
import type { QueryClient } from '@tanstack/react-query';

export const poemId = 44;
export const collectionId = 12;

export const fullPoem: FullPoem = {
	id: poemId,
	title: 'A cached poem',
	slug: 'a-cached-poem',
	excerpt: 'Cached excerpt',
	content: 'Cached content',
	audioUrl: null,
	status: 'published',
	visibility: 'public',
	moderationStatus: 'approved',
	isCommentable: true,
	createdAt: new Date('2026-06-20T12:00:00.000Z'),
	updatedAt: new Date('2026-06-20T12:00:00.000Z'),
	tags: [{ id: 1, name: 'cache' }],
	author: {
		id: 1,
		name: 'Poet',
		nickname: 'poet',
		avatarUrl: null,
	},
	stats: {
		likesCount: 3,
		commentsCount: 1,
		likedByCurrentUser: false,
	},
};

export const savedPoem: SavedPoem = {
	id: poemId,
	title: 'A cached poem',
	slug: 'a-cached-poem',
	savedAt: '2026-06-20T12:00:00.000Z',
	author: fullPoem.author,
};

export const poemCollection: PoemCollection = {
	id: collectionId,
	name: 'Favorites',
	description: 'Poems to revisit',
	poemIds: [poemId],
	createdAt: '2026-06-20T12:00:00.000Z',
	updatedAt: '2026-06-20T12:00:00.000Z',
};

export function getPoemKey(id: number | string) {
	return ['poem', String(id)] as const;
}

export function seedPoem(queryClient: QueryClient, poem: FullPoem = fullPoem) {
	queryClient.setQueryData(getPoemKey(poem.id), poem);
}

export function seedSavedPoems(queryClient: QueryClient, poems: SavedPoem[] = [savedPoem]) {
	queryClient.setQueryData(poemKeys.saved(), poems);
}

export function seedCollections(
	queryClient: QueryClient,
	collections: PoemCollection[] = [poemCollection],
) {
	queryClient.setQueryData(poemKeys.collections(), collections);
}

export function getSavedPoems(queryClient: QueryClient) {
	return queryClient.getQueryData<SavedPoem[]>(poemKeys.saved());
}

export function getCollections(queryClient: QueryClient) {
	return queryClient.getQueryData<PoemCollection[]>(poemKeys.collections());
}
