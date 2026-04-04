import type { UsersCachePort } from '@core/ports/users';

import { userKeys } from '../api/keys';

export const usersCachePort: UsersCachePort = {
	getProfileKey: (userId) => userKeys.profile(String(userId)),
};
