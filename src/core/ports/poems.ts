import type { PaginatedPoemsType, SearchPoemsParams } from '@features/poems/public/types';

export type QueryOptions<TData> = {
	queryKey: readonly unknown[];
	queryFn: () => Promise<TData>;
};

export type PoemsQueryPort = {
	getSearchQueryOptions: (params: SearchPoemsParams) => QueryOptions<PaginatedPoemsType>;
	getRecentPoems: (params: { limit: number }) => Promise<PaginatedPoemsType>;
};

let poemsQueryPort: PoemsQueryPort | null = null;

export function registerPoemsQueryPort(port: PoemsQueryPort) {
	poemsQueryPort = port;
}

export function getPoemsQueryPort(): PoemsQueryPort {
	if (!poemsQueryPort) throw new Error('PoemsQueryPort not registered. Register it in main.tsx.');
	return poemsQueryPort;
}
