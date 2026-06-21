// @vitest-environment happy-dom
import { bannedAccessError } from '@root/core/testing/appErrors';
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { avatarFile } from './fixtures';
import { makeUpdateMyProfileScenario } from './makeUpdateMyProfileScenario';

describe('FEATURE HOOK - Users - useUpdateMyProfile', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does not allow profile edits without an authenticated client', () => {
		const scenario = makeUpdateMyProfileScenario().asLoggedOutVisitor();

		const { result } = scenario.render();

		expect(result.current.canEditProfile).toBe(false);
	});

	it('uploads a new avatar, updates the profile, and patches cached profile data', async () => {
		const file = avatarFile();
		const scenario = makeUpdateMyProfileScenario()
			.asAuthenticatedUser()
			.withCachedProfile()
			.withAvatarUploadSuccess()
			.withUpdateSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.updateMyProfile({
				name: 'Updated Poet',
				nickname: 'updated-poet',
				bio: 'Updated bio',
				avatarFile: file,
			});
		});

		expect(scenario.mocks.uploadAvatarFile).toHaveBeenCalledWith(file);
		expect(scenario.mocks.updateUser).toHaveBeenCalledWith({
			id: '123',
			name: 'Updated Poet',
			nickname: 'updated-poet',
			bio: 'Updated bio',
			avatarUrl: 'https://example.com/new-avatar.png',
		});
		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				name: 'Updated Poet',
				nickname: 'updated-poet',
				bio: 'Updated bio',
				avatarUrl: 'https://example.com/new-avatar.png',
			}),
		);
	});

	it('maps nickname conflicts to a clear error and conflict field', async () => {
		const scenario = makeUpdateMyProfileScenario()
			.asAuthenticatedUser()
			.withCachedProfile()
			.withUpdateFailure({ statusCode: 409, message: 'nickname already exists' });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.updateMyProfile({
					nickname: 'taken',
				});
			}),
		).rejects.toMatchObject({ statusCode: 409 });

		await waitFor(() => {
			expect(result.current.updateProfileError).toBe('This nickname is already in use.');
			expect(result.current.conflictField).toBe('nickname');
		});
	});

	it('keeps edit controls authenticated but shows banned-user copy when update is blocked', async () => {
		const scenario = makeUpdateMyProfileScenario()
			.asBannedUser()
			.withCachedProfile()
			.withUpdateFailure(bannedAccessError);

		const { result } = scenario.render();

		expect(result.current.canEditProfile).toBe(true);
		await expect(
			act(async () => {
				await result.current.updateMyProfile({
					name: 'Blocked Poet',
				});
			}),
		).rejects.toMatchObject({ statusCode: 401 });

		expect(scenario.getCachedProfile()).toEqual(
			expect.objectContaining({
				name: 'Poet Name',
			}),
		);
		await waitFor(() => expect(result.current.updateProfileError).toContain("can't edit profiles"));
	});
});
