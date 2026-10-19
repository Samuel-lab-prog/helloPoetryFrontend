import { ColorModeProvider } from '@BaseComponents';
import { ChakraProvider } from '@chakra-ui/react';
import { queryClient } from '@QueryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { system } from '@themes/main';
import type { ReactNode } from 'react';

export function AppProviders({ children }: { children: ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<ChakraProvider value={system}>
				<ColorModeProvider forcedTheme='dark' enableSystem={false}>
					{children}
				</ColorModeProvider>
			</ChakraProvider>
		</QueryClientProvider>
	);
}
