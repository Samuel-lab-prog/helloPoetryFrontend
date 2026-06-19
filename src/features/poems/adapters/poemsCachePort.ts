import { poemKeys } from '@Api/poems/keys';
import type { PoemsCachePort } from '@core/ports/poems';
import { getCurrentAuthCacheScope } from '@features/auth/public';

export const poemsCachePort: PoemsCachePort = {
	getPoemKey: (poemId) => poemKeys.byIdForViewer(String(poemId), getCurrentAuthCacheScope()),
};
