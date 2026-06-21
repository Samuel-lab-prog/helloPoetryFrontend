import { Provider } from '@BaseComponents';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { createTestQueryClient } from './renderHookWithQueryClient';

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
	queryClient?: QueryClient;
	route?: string;
};

export function renderWithProviders(
	ui: ReactElement,
	{
		queryClient = createTestQueryClient(),
		route = '/',
		...renderOptions
	}: RenderWithProvidersOptions = {},
) {
	function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<Provider forcedTheme='light'>
					<MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
				</Provider>
			</QueryClientProvider>
		);
	}

	return {
		queryClient,
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}
