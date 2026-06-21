import { moderation } from '@Api/moderation/endpoints';
import { moderationKeys } from '@Api/moderation/keys';
import { poemKeys } from '@Api/poems/keys';
import { userKeys } from '@Api/users/keys';
import { toaster } from '@BaseComponents';
import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	isBannedAccessError,
} from '@features/auth/public';
import { queryClient } from '@QueryClient';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useCallback } from 'react';

import type {
	ModerationAction,
	ModerationActionCompletePayload,
	ModerationActionInput,
} from '../types';
import { moderationActionConfig } from '../utils/actionConfig';

type UseModerationActionsOptions = {
	onActionComplete?: (payload: ModerationActionCompletePayload) => void;
};

function isUserAction(action: ModerationAction) {
	return (
		action === 'ban-user' ||
		action === 'suspend-user' ||
		action === 'unban-user' ||
		action === 'unsuspend-user'
	);
}

function getModerationSuspendedAction(action: ModerationAction) {
	if (isUserAction(action)) return 'moderate users';
	return 'moderate poems';
}

function getModerationActionErrorDescription(error: unknown, action: ModerationAction) {
	const appError = error as AppErrorType | undefined;

	if (appError?.statusCode === 401 && isBannedAccessError(appError)) {
		return getBannedPrivilegeMessage(getModerationSuspendedAction(action));
	}

	if (appError?.statusCode === 403) {
		return getAccessDeniedMessage({
			fallback: appError.message || 'You do not have permission to use moderation tools.',
			suspendedAction: getModerationSuspendedAction(action),
		});
	}

	if (error instanceof Error) return error.message;
	return appError?.message ?? 'Try again later.';
}

async function invalidateModerationTargets(input: ModerationActionInput) {
	const poemId = input.poem?.id;
	const userId = input.user?.id;

	await Promise.all([
		queryClient.invalidateQueries({ queryKey: moderationKeys.all() }),
		queryClient.invalidateQueries({ queryKey: poemKeys.all() }),
		queryClient.invalidateQueries({ queryKey: poemKeys.mine() }),
		queryClient.invalidateQueries({ queryKey: userKeys.all() }),
		...(poemId ? [queryClient.invalidateQueries({ queryKey: poemKeys.byId(String(poemId)) })] : []),
		...(userId
			? [
					queryClient.invalidateQueries({ queryKey: userKeys.profile(String(userId)) }),
					queryClient.invalidateQueries({
						queryKey: moderationKeys.userSanctions(String(userId)),
					}),
					queryClient.invalidateQueries({
						queryKey: moderationKeys.userSanctionStatus(String(userId)),
					}),
				]
			: []),
	]);
}

export function useModerationActions(options: UseModerationActionsOptions = {}) {
	const banMutation = useMutation({
		mutationFn: (input: ModerationActionInput) =>
			moderation.banUser.mutate({
				userId: String(input.user?.id),
				reason: input.reason?.trim() ?? '',
			}),
	});
	const suspendMutation = useMutation({
		mutationFn: (input: ModerationActionInput) =>
			moderation.suspendUser.mutate({
				userId: String(input.user?.id),
				reason: input.reason?.trim() ?? '',
				durationDays: input.durationDays,
			}),
	});
	const unbanMutation = useMutation({
		mutationFn: (input: ModerationActionInput) =>
			moderation.unbanUser.mutate({ userId: String(input.user?.id) }),
	});
	const unsuspendMutation = useMutation({
		mutationFn: (input: ModerationActionInput) =>
			moderation.unsuspendUser.mutate({ userId: String(input.user?.id) }),
	});
	const moderatePoemMutation = useMutation({
		mutationFn: (input: ModerationActionInput) => {
			const moderationStatus =
				input.action === 'approve-poem'
					? 'approved'
					: input.action === 'reject-poem'
						? 'rejected'
						: 'removed';

			return moderation.moderatePoem.mutate({
				poemId: String(input.poem?.id),
				moderationStatus,
				reason: input.reason?.trim() || undefined,
			});
		},
	});

	const executeAction = useCallback(
		async (input: ModerationActionInput) => {
			const config = moderationActionConfig[input.action];

			if (isUserAction(input.action) && !input.user) return;
			if (!isUserAction(input.action) && !input.poem) return;

			try {
				if (input.action === 'ban-user') await banMutation.mutateAsync(input);
				else if (input.action === 'suspend-user') await suspendMutation.mutateAsync(input);
				else if (input.action === 'unban-user') await unbanMutation.mutateAsync(input);
				else if (input.action === 'unsuspend-user') await unsuspendMutation.mutateAsync(input);
				else await moderatePoemMutation.mutateAsync(input);

				await invalidateModerationTargets(input);
				toaster.create({
					type: 'success',
					title: config.successTitle,
					closable: true,
				});
				options.onActionComplete?.({
					action: input.action,
					poem: input.poem,
					user: input.user,
				});
			} catch (error) {
				toaster.create({
					type: 'error',
					title: config.errorTitle,
					description: getModerationActionErrorDescription(error, input.action),
					closable: true,
				});
				throw error;
			}
		},
		[banMutation, moderatePoemMutation, options, suspendMutation, unbanMutation, unsuspendMutation],
	);

	return {
		executeAction,
		isPending:
			banMutation.isPending ||
			suspendMutation.isPending ||
			unbanMutation.isPending ||
			unsuspendMutation.isPending ||
			moderatePoemMutation.isPending,
	};
}
