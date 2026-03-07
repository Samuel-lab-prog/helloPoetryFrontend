import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from '@features/base';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { system } from '@themes/main';
import { ChakraProvider } from '@chakra-ui/react';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<Provider>
				<ChakraProvider value={system}>
					<App />
				</ChakraProvider>
			</Provider>
		</QueryClientProvider>
	</StrictMode>,
);
