import { restoreSnapshot, snapshotQueryData } from '@Api/optimistic';
import { getFriendsActionsPort } from '@core/ports/friends';
import { getUsersCachePort } from '@core/ports/users';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import type { AuthorProfileType } from '@features/poems/public/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useCallback, useEffect, useRef, useState } from 'react';

const EXIT_ANIMATION_MS = 220;

export function useFriendRequestActions() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const friendsActionsPort = getFriendsActionsPort();
	const usersCachePort = getUsersCachePort();
	const profileKey = clientId
		? usersCachePort.getProfileKey(clientId)
		: (['users', 'profile'] as const);
	const [removingRequesterIds, setRemovingRequesterIds] = useState<Set<number>>(new Set());
	const [hiddenRequesterIds, setHiddenRequesterIds] = useState<Set<number>>(new Set());
	const removalTimersRef = useRef(new Map<number, number>());

	const clearRemovalTimer = useCallback((requesterId: number) => {
		const timer = removalTimersRef.current.get(requesterId);
		if (timer) {
			window.clearTimeout(timer);
			removalTimersRef.current.delete(requesterId);
		}
	}, []);

	const restoreRequester = useCallback(
		(requesterId: number) => {
			clearRemovalTimer(requesterId);
			setRemovingRequesterIds((prev) => {
				const next = new Set(prev);
				next.delete(requesterId);
				return next;
			});
			setHiddenRequesterIds((prev) => {
				const next = new Set(prev);
				next.delete(requesterId);
				return next;
			});
		},
		[clearRemovalTimer],
	);

	const scheduleHideRequester = useCallback(
		(requesterId: number) => {
			clearRemovalTimer(requesterId);
			const timer = window.setTimeout(() => {
				setHiddenRequesterIds((prev) => new Set(prev).add(requesterId));
				setRemovingRequesterIds((prev) => {
					const next = new Set(prev);
					next.delete(requesterId);
					return next;
				});
				queryClient.invalidateQueries({ queryKey: friendsActionsPort.getRequestsKey() });
				removalTimersRef.current.delete(requesterId);
			}, EXIT_ANIMATION_MS);
			removalTimersRef.current.set(requesterId, timer);
		},
		[clearRemovalTimer, friendsActionsPort, queryClient],
	);

	useEffect(
		() => () => {
			removalTimersRef.current.forEach((timer) => window.clearTimeout(timer));
			removalTimersRef.current.clear();
		},
		[],
	);

	const acceptMutation = useMutation({
		mutationFn: (requesterId: number) => friendsActionsPort.acceptFriendRequest(requesterId),
		onMutate: async (requesterId) => {
			const queryKey = usersCachePort.getProfileKey(requesterId);
			const previousProfile = await snapshotQueryData<AuthorProfileType>(queryClient, queryKey);
			setRemovingRequesterIds((prev) => new Set(prev).add(requesterId));

			if (previousProfile.data) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile.data,
					hasIncomingFriendRequest: false,
					isFriend: true,
				});
			}

			return { previousProfile, queryKey };
		},
		onError: (_error, _requesterId, context) => {
			restoreRequester(_requesterId);
			restoreSnapshot(queryClient, context?.previousProfile);
		},
		onSuccess: (_data, requesterId) => {
			scheduleHideRequester(requesterId);
			queryClient.invalidateQueries({ queryKey: profileKey });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (requesterId: number) => friendsActionsPort.rejectFriendRequest(requesterId),
		onMutate: async (requesterId) => {
			const queryKey = usersCachePort.getProfileKey(requesterId);
			const previousProfile = await snapshotQueryData<AuthorProfileType>(queryClient, queryKey);
			setRemovingRequesterIds((prev) => new Set(prev).add(requesterId));

			if (previousProfile.data) {
				queryClient.setQueryData<AuthorProfileType>(queryKey, {
					...previousProfile.data,
					hasIncomingFriendRequest: false,
					isFriend: true,
				});
			}

			return { previousProfile, queryKey };
		},
		onError: (_error, _requesterId, context) => {
			restoreRequester(_requesterId);
			restoreSnapshot(queryClient, context?.previousProfile);
		},
		onSuccess: (_data, requesterId) => {
			scheduleHideRequester(requesterId);
			queryClient.invalidateQueries({ queryKey: profileKey });
		},
		onSettled: (_data, _error, _requesterId, context) => {
			if (context?.queryKey) {
				queryClient.invalidateQueries({ queryKey: context.queryKey });
			}
		},
	});

	function getErrorMessage() {
		const err = (acceptMutation.error || rejectMutation.error) as unknown as
			| AppErrorType
			| undefined;
		if (!err) return '';
		if (err.statusCode === 404) return 'Request not found.';
		if (err.statusCode === 403) return 'You cannot perform this action.';
		return 'Error processing request.';
	}

	return {
		acceptRequest: acceptMutation.mutateAsync,
		rejectRequest: rejectMutation.mutateAsync,
		isAccepting: acceptMutation.isPending,
		isRejecting: rejectMutation.isPending,
		isAcceptingRequester: (requesterId: number) =>
			acceptMutation.isPending && acceptMutation.variables === requesterId,
		isRejectingRequester: (requesterId: number) =>
			rejectMutation.isPending && rejectMutation.variables === requesterId,
		isRemovingRequester: (requesterId: number) => removingRequesterIds.has(requesterId),
		isHiddenRequester: (requesterId: number) => hiddenRequesterIds.has(requesterId),
		errorMessage: getErrorMessage(),
		restoreRequester,
	};
}
