import { createQueryEndpoint } from '@core/api/utils';
import { createHTTPRequest } from '@Utils';

import { feedKeys } from './keys';
import type { FeedPoem } from './types';

const getFeed = createQueryEndpoint<[], FeedPoem[]>({
	key: feedKeys.all,

	fn: () =>
		createHTTPRequest<FeedPoem[]>({
			method: 'GET',
			path: `/feed`,
		}),
});

export const feed = {
	getFeed,
};
