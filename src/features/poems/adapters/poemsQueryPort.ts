import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { PoemsQueryPort } from '@core/ports/poems';

import type { PaginatedPoemsType, SearchPoemsParams } from '../public/types';

export const poemsQueryPort: PoemsQueryPort = {
	getSearchQueryOptions(params: SearchPoemsParams) {
		const query = poems.getPoems.query(params);

		return {
			queryKey: poemKeys.search(params),
			queryFn: async () => (await query.queryFn()) as PaginatedPoemsType,
		};
	},
	async getRecentPoems({ limit }) {
		const query = poems.getPoems.query({
			limit,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		});

		return (await query.queryFn()) as PaginatedPoemsType;
	},
};
