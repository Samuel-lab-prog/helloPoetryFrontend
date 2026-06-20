import { poemKeys } from '@Api/poems/keys';
import type { FullPoem } from '@Api/poems/types';
import type { QueryClient } from '@tanstack/react-query';

export const poemId = 44;

export const fullPoem: FullPoem = {
	id: poemId,
	title: 'Poem to delete',
	slug: 'poem-to-delete',
	excerpt: 'Delete me',
	content: 'This poem will be deleted.',
	audioUrl: null,
	status: 'draft',
	visibility: 'public',
	moderationStatus: 'approved',
	isCommentable: true,
	createdAt: new Date('2026-06-20T12:00:00.000Z'),
	updatedAt: new Date('2026-06-20T12:00:00.000Z'),
	tags: [],
	author: {
		id: 123,
		name: 'Poet',
		nickname: 'poet',
		avatarUrl: null,
	},
	stats: {
		likesCount: 0,
		commentsCount: 0,
		likedByCurrentUser: false,
	},
};

export function getPoemKey(id: number | string) {
	return ['poem', String(id)] as const;
}

export function seedDeleteCaches(queryClient: QueryClient) {
	queryClient.setQueryData<FullPoem[]>(poemKeys.mine(), [fullPoem]);
	queryClient.setQueryData<FullPoem>(getPoemKey(poemId), fullPoem);
}
