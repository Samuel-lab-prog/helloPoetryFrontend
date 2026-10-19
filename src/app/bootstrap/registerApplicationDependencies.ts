import { registerAuthSessionPort } from '@core/ports/authSession';
import { registerFriendsActionsPort, registerFriendsRequestsPort } from '@core/ports/friends';
import { registerPoemsCachePort, registerPoemsQueryPort } from '@core/ports/poems';
import { registerUsersCachePort } from '@core/ports/users';
import { registerEventListeners } from '@Events';
import { queryClient } from '@QueryClient';
import { authSessionPort } from '@root/features/auth/adapters/authSessionPort.ts';
import { friendsActionsPort } from '@root/features/friends/adapters/friendsActionsPort.ts';
import { friendsRequestsPort } from '@root/features/friends/adapters/friendsRequestsPort.ts';
import { poemsCachePort } from '@root/features/poems/adapters/poemsCachePort.ts';
import { poemsQueryPort } from '@root/features/poems/adapters/poemsQueryPort.ts';
import { usersCachePort } from '@root/features/users/adapters/usersCachePort.ts';

export function registerApplicationDependencies() {
	registerFriendsActionsPort(friendsActionsPort);
	registerFriendsRequestsPort(friendsRequestsPort);
	registerUsersCachePort(usersCachePort);
	registerPoemsCachePort(poemsCachePort);
	registerPoemsQueryPort(poemsQueryPort);
	registerAuthSessionPort(authSessionPort);
	registerEventListeners(queryClient);
}
