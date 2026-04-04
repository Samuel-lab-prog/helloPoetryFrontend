import { ColorModeProvider, Provider } from '@BaseComponents';
import { ChakraProvider } from '@chakra-ui/react';
import { registerPoemsQueryPort } from '@core/ports/poems';
import { registerEventListeners } from '@Events';
import { queryClient } from '@QueryClient';
import { poemsQueryPort } from '@root/features/poems/adapters/poemsQueryPort.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { system } from '@themes/main';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

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
