import { poemKeys } from '@Api/poems/keys';
import type { PoemsCachePort } from '@core/ports/poems';

export const poemsCachePort: PoemsCachePort = {
	getPoemKey: (poemId) => poemKeys.byId(String(poemId)),
};
