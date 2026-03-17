import { createHTTPRequest } from '@http-request';
import { createQueryEndpoint } from '../utils';

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


