import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { usePoem } from '../usePoem';
import { fullPoem } from './fixtures';

export function makePoemScenario() {
	setTestAuthClient();
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asAuthenticatedUser() {
			setTestAuthClient();
			return scenario;
		},
		withPoemSuccess() {
			scenario.mocks.queryFn = vi.fn(() => Promise.resolve(fullPoem));
			scenario.mocks.getPoem = vi.spyOn(poems.getPoem, 'query').mockReturnValue({
				queryKey: poemKeys.byId(String(fullPoem.id)),
				queryFn: scenario.mocks.queryFn as () => Promise<typeof fullPoem>,
			});
			return scenario;
		},
		withPoemFailure(error: unknown) {
			scenario.mocks.queryFn = vi.fn(() => Promise.reject(error));
			scenario.mocks.getPoem = vi.spyOn(poems.getPoem, 'query').mockReturnValue({
				queryKey: poemKeys.byId(String(fullPoem.id)),
				queryFn: scenario.mocks.queryFn as () => Promise<typeof fullPoem>,
			});
			return scenario;
		},
		render(id = fullPoem.id) {
			return renderHook(() => usePoem(id), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}
