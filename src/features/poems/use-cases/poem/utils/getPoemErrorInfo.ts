import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	isBannedAccessError,
} from '@features/auth/public';
import { type AppErrorType } from '@Utils';

export function getPoemErrorInfo(error: unknown) {
	const appError = error as AppErrorType | undefined;
	const status = appError?.statusCode;
	const message = typeof appError?.message === 'string' ? appError.message.toLowerCase() : '';

	if (isBannedAccessError(appError)) {
		return {
			eyebrow: 'POEM UNAVAILABLE',
			title: getBannedPrivilegeMessage('view poems'),
			description:
				'This account cannot open poems while it is banned. Please use a different account or contact support if this seems incorrect.',
		};
	}

	if (status === 403) {
		return {
			eyebrow: 'POEM UNAVAILABLE',
			title: getAccessDeniedMessage({
				bannedAction: 'view poems',
				fallback: 'You do not have permission to view this poem.',
			}),
			description: getAccessDeniedMessage({
				bannedMessage:
					'This account cannot open poems while it is banned. Please use a different account or contact support if this seems incorrect.',
				fallback:
					'This poem may be private, under moderation, or no longer available to your account.',
			}),
		};
	}

	if (status === 404) {
		return {
			eyebrow: 'POEM NOT FOUND',
			title: 'This poem could not be found.',
			description: 'It may have been deleted or the link may be invalid.',
		};
	}

	if (status === 401) {
		return {
			eyebrow: 'SESSION EXPIRED',
			title: 'Please sign in again to continue.',
			description: 'Your session expired while loading this poem.',
		};
	}

	if (message.includes('access denied')) {
		return {
			eyebrow: 'POEM UNAVAILABLE',
			title: getAccessDeniedMessage({
				bannedAction: 'view poems',
				fallback: 'You do not have permission to view this poem.',
			}),
			description: getAccessDeniedMessage({
				bannedMessage:
					'This account cannot open poems while it is banned. Please use a different account or contact support if this seems incorrect.',
				fallback:
					'This poem may be private, under moderation, or no longer available to your account.',
			}),
		};
	}

	return {
		eyebrow: 'POEM UNAVAILABLE',
		title: 'We could not load this poem right now.',
		description: 'Please try again in a moment, or refresh the page to reconnect.',
	};
}
