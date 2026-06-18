import { useAuthClientStore } from '../stores/useAuthClientStore';

type AccessDeniedMessageOptions = {
	fallback: string;
	suspendedMessage?: string;
};

export function getAccessDeniedMessage({
	fallback,
	suspendedMessage,
}: AccessDeniedMessageOptions) {
	const userStatus = useAuthClientStore.getState().authClient?.status;

	if (userStatus === 'suspended' && suspendedMessage) {
		return suspendedMessage;
	}

	return fallback;
}
