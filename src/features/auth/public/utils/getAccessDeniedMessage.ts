import { useAuthClientStore } from '../stores/useAuthClientStore';

type AccessDeniedMessageOptions = {
	bannedAction?: string;
	bannedMessage?: string;
	fallback: string;
	suspendedAction?: string;
	suspendedMessage?: string;
};

export function getAccessDeniedMessage({
	bannedAction,
	bannedMessage,
	fallback,
	suspendedAction,
	suspendedMessage,
}: AccessDeniedMessageOptions) {
	const userStatus = useAuthClientStore.getState().authClient?.status;

	if (userStatus === 'banned') {
		if (bannedMessage) return bannedMessage;
		if (bannedAction) return getBannedPrivilegeMessage(bannedAction);
		if (suspendedAction) return getBannedPrivilegeMessage(suspendedAction);
	}

	if (userStatus === 'suspended') {
		if (suspendedMessage) return suspendedMessage;
		if (suspendedAction) return getSuspendedPrivilegeMessage(suspendedAction);
	}

	return fallback;
}

export function getSuspendedPrivilegeMessage(action?: string) {
	if (!action) {
		return 'Some account privileges are unavailable while your account is suspended.';
	}

	return `This account privilege is unavailable while your account is suspended: ${action}.`;
}

export function getBannedPrivilegeMessage(action?: string) {
	if (!action) {
		return 'This account has been banned, so account access is unavailable. If you think this is a mistake, please contact support.';
	}

	return `This account has been banned, so you can't ${action}. If you think this is a mistake, please contact support.`;
}

export function isBannedAccessError(error?: unknown) {
	if (useAuthClientStore.getState().authClient?.status === 'banned') return true;

	const appError = error as { message?: unknown } | null;
	if (typeof appError?.message !== 'string') return false;

	return appError.message.toLowerCase().includes('banned');
}
