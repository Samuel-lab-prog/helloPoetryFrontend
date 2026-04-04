import { ColorModeProvider, Provider } from '@BaseComponents';
import { ChakraProvider } from '@chakra-ui/react';
import { registerFriendsActionsPort, registerFriendsRequestsPort } from '@core/ports/friends';
import { registerPoemsCachePort, registerPoemsQueryPort } from '@core/ports/poems';
import { registerUsersCachePort } from '@core/ports/users';
import { registerEventListeners } from '@Events';
import { queryClient } from '@QueryClient';
import { friendsActionsPort } from '@root/features/friends/adapters/friendsActionsPort.ts';
import { friendsRequestsPort } from '@root/features/friends/adapters/friendsRequestsPort.ts';
import { poemsCachePort } from '@root/features/poems/adapters/poemsCachePort.ts';
import { poemsQueryPort } from '@root/features/poems/adapters/poemsQueryPort.ts';
import { usersCachePort } from '@root/features/users/adapters/usersCachePort.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { system } from '@themes/main';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

registerFriendsActionsPort(friendsActionsPort);
registerFriendsRequestsPort(friendsRequestsPort);
registerUsersCachePort(usersCachePort);
registerPoemsCachePort(poemsCachePort);
registerPoemsQueryPort(poemsQueryPort);
registerEventListeners(queryClient);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Provider>
				<ChakraProvider value={system}>
					<ColorModeProvider>
						<App />
					</ColorModeProvider>
				</ChakraProvider>
			</Provider>
		</QueryClientProvider>
	</StrictMode>,
);
