import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { system } from '@themes/main';
import { Provider } from '@BaseComponents';
import { registerEventListeners } from '@Events';
import { queryClient } from '@QueryClient';
import { ColorModeProvider } from './components/ui/color-mode.tsx';
import App from './App.tsx';

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
