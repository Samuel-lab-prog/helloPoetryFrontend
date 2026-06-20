import { auth } from '@Api/auth/endpoints';
import { eventBus } from '@root/core/events/eventBus';
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useLoginForm } from '../useLoginForm';
import { authClient } from './fixtures';

export function makeLoginFormScenario() {
	clearTestAuthClient();
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {
			userLoggedIn: vi.spyOn(eventBus, 'publish').mockResolvedValue(),
		} as Record<string, unknown>,
		withLoginSuccess() {
			scenario.mocks.login = vi.spyOn(auth.login, 'mutate').mockResolvedValue(authClient);
			return scenario;
		},
		withLoginFailure(error: unknown) {
			scenario.mocks.login = vi.spyOn(auth.login, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(() => useLoginForm(), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}
