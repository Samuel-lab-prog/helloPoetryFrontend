// @vitest-environment happy-dom
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { avatarFile, registerData } from './fixtures';
import { makeRegisterFormScenario } from './makeRegisterFormScenario';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('FEATURE HOOK - Users - useRegisterForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		navigateMock.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('uploads the avatar, creates the user, and navigates to login', async () => {
		const file = avatarFile();
		const scenario = makeRegisterFormScenario().withAvatarUploadSuccess().withRegisterSuccess();

		const { result } = scenario.render();

		act(() => {
			result.current.onSubmit({
				...registerData,
				avatar: file,
			});
		});

		await waitFor(() =>
			expect(scenario.mocks.createUser).toHaveBeenCalledWith({
				name: 'New Poet',
				nickname: 'new_poet',
				email: 'new-poet@example.com',
				password: 'strong-password',
				bio: 'A new profile',
				avatarUrl: 'https://example.com/avatar.png',
			}),
		);
		expect(scenario.mocks.uploadAvatarFile).toHaveBeenCalledWith(file);
		expect(navigateMock).toHaveBeenCalledWith('/login');
	});

	it('maps nickname conflicts to a field error', async () => {
		const scenario = makeRegisterFormScenario().withRegisterFailure({
			statusCode: 409,
			message: 'nickname already exists',
		});

		const { result } = scenario.render();

		act(() => {
			result.current.onSubmit(registerData);
		});

		await waitFor(() =>
			expect(result.current.formState.errors.nickname?.message).toBe(
				'This nickname is already in use.',
			),
		);
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it('keeps registration from running when avatar upload fails', async () => {
		const scenario = makeRegisterFormScenario()
			.withAvatarUploadFailure('Avatar upload failed')
			.withRegisterSuccess();

		const { result } = scenario.render();

		act(() => {
			result.current.onSubmit({
				...registerData,
				avatar: avatarFile(),
			});
		});

		await waitFor(() =>
			expect(result.current.formState.errors.avatar?.message).toBe('Avatar upload failed'),
		);
		expect(scenario.mocks.createUser).not.toHaveBeenCalled();
	});
});
