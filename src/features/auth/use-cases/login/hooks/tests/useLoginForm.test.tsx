// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authClient, loginData } from './fixtures';
import { makeLoginFormScenario } from './makeLoginFormScenario';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('FEATURE HOOK - Auth - useLoginForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		navigateMock.mockReset();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('stores the authenticated client, publishes login event, and navigates home', async () => {
		const scenario = makeLoginFormScenario().withLoginSuccess();

		const { result } = scenario.render();

		act(() => {
			result.current.onSubmit(loginData);
		});

		await waitFor(() => expect(useAuthClientStore.getState().authClient).toEqual(authClient));
		expect(scenario.mocks.login).toHaveBeenCalledWith(loginData);
		expect(scenario.mocks.userLoggedIn).toHaveBeenCalledWith(
			'userLoggedIn',
			expect.objectContaining({
				userId: authClient.id,
				role: authClient.role,
			}),
		);
		expect(navigateMock).toHaveBeenCalledWith('/', { replace: true });
	});

	it('shows banned login failures as a general error', async () => {
		const scenario = makeLoginFormScenario().withLoginFailure({
			statusCode: 401,
			message: 'user is banned',
		});

		const { result } = scenario.render();

		act(() => {
			result.current.onSubmit(loginData);
		});

		await waitFor(() => expect(result.current.generalError).toContain("can't sign in"));
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
