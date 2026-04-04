import type { PoemsCachePort } from '@core/ports/poems';

import { poemKeys } from '../api/keys';

export const poemsCachePort: PoemsCachePort = {
	getPoemKey: (poemId) => poemKeys.byId(String(poemId)),
};
