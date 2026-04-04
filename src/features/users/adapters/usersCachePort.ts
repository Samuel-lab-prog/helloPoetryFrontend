import { userKeys } from '@Api/users/keys';
import type { UsersCachePort } from '@core/ports/users';

export const usersCachePort: UsersCachePort = {
	getProfileKey: (userId) => userKeys.profile(String(userId)),
};
