import { createQueryKeys } from '../utils';

export const poemKeys = createQueryKeys({
	all: () => ['poems'] as const,
	byId: (id: string) => ['poem', id] as const,
	mine: () => ['poems', 'me'] as const,
	byAuthor: (authorId: string) => ['poems', 'author', authorId] as const,
	search: (params?: {
		limit?: number;
		cursor?: number;
		searchTitle?: string;
		tags?: string[];
		orderBy?: 'createdAt' | 'title';
		orderDirection?: 'asc' | 'desc';
	}) => ['poems', 'search', params ?? {}] as const,
	saved: () => ['poems', 'saved'] as const,
	collections: () => ['poems', 'collections'] as const,
});

