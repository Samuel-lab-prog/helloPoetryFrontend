import { type FriendsActionsPort, registerFriendsActionsPort } from '@root/core/ports/friends';
import { registerUsersCachePort } from '@root/core/ports/users';
import {
	clearTestAuthClient,
	setTestAuthClient,
	setTestAuthStatus,
} from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import type { AuthorProfileType } from '@root/features/poems/public/types';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCancelFriendRequest } from '../useCancelFriendRequest';
import { useFriendRequestActions } from '../useFriendRequestActions';
import { useSendFriendRequest } from '../useSendFriendRequest';
import {
	authorId,
	authorProfile,
	getProfileKey,
	getRequestsKey,
	requesterId,
	seedAuthorProfile,
} from './fixtures';

function createFriendsActionsPort() {
	const port = {
		sendFriendRequest: vi.fn(() =>
			Promise.resolve({
				id: 1,
				requesterId: 123,
				addresseeId: authorId,
				createdAt: '2026-06-20T12:00:00.000Z',
			}),
		),
		cancelFriendRequest: vi.fn(() => Promise.resolve()),
		acceptFriendRequest: vi.fn(() => Promise.resolve()),
		rejectFriendRequest: vi.fn(() => Promise.resolve()),
		getRequestsKey: vi.fn(getRequestsKey),
	} satisfies FriendsActionsPort;

	registerFriendsActionsPort(port);
	return port;
}

function registerFriendPorts() {
	registerUsersCachePort({
		getProfileKey,
	});

	return createFriendsActionsPort();
}

function createBaseFriendScenario() {
	setTestAuthClient();
	const queryClient = createTestQueryClient();
	const friendsActionsPort = registerFriendPorts();
	const scenario = {
		queryClient,
		friendsActionsPort,
		mocks: {
			friendsActionsPort,
		} as Record<string, unknown>,
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return this;
		},
		asAuthenticatedUser() {
			setTestAuthClient();
			return this;
		},
		asBannedUser() {
			setTestAuthStatus('banned');
			return this;
		},
		withAuthorProfile(profile: AuthorProfileType = authorProfile) {
			seedAuthorProfile(queryClient, profile);
			return this;
		},
		withSendFailure(error: unknown = new Error('send failed')) {
			friendsActionsPort.sendFriendRequest = vi.fn(() => Promise.reject(error));
			return this;
		},
		withCancelFailure(error: unknown = new Error('cancel failed')) {
			friendsActionsPort.cancelFriendRequest = vi.fn(() => Promise.reject(error));
			return this;
		},
		withAcceptFailure(error: unknown = new Error('accept failed')) {
			friendsActionsPort.acceptFriendRequest = vi.fn(() => Promise.reject(error));
			return this;
		},
		withRejectFailure(error: unknown = new Error('reject failed')) {
			friendsActionsPort.rejectFriendRequest = vi.fn(() => Promise.reject(error));
			return this;
		},
		getCachedProfile(id = authorId) {
			return queryClient.getQueryData<AuthorProfileType>(getProfileKey(id));
		},
	};

	return scenario;
}

export function makeSendFriendRequestScenario() {
	const scenario = createBaseFriendScenario();
	return Object.assign(scenario, {
		render() {
			return renderHook(() => useSendFriendRequest(), {
				wrapper: createQueryClientWrapper(scenario.queryClient),
			});
		},
	});
}

export function makeCancelFriendRequestScenario() {
	const scenario = createBaseFriendScenario();
	return Object.assign(scenario, {
		render() {
			return renderHook(() => useCancelFriendRequest(), {
				wrapper: createQueryClientWrapper(scenario.queryClient),
			});
		},
	});
}

export function makeFriendRequestActionsScenario() {
	const incomingProfile: AuthorProfileType = {
		...authorProfile,
		id: requesterId,
		isFriend: false,
		isFriendRequester: false,
		hasIncomingFriendRequest: true,
	};
	const scenario = createBaseFriendScenario();
	return Object.assign(scenario, {
		withRequesterProfile(profile: AuthorProfileType = incomingProfile) {
			seedAuthorProfile(scenario.queryClient, profile);
			return this;
		},
		getCachedRequesterProfile(id = requesterId) {
			return scenario.queryClient.getQueryData<AuthorProfileType>(getProfileKey(id));
		},
		render() {
			return renderHook(() => useFriendRequestActions(), {
				wrapper: createQueryClientWrapper(scenario.queryClient),
			});
		},
	});
}
