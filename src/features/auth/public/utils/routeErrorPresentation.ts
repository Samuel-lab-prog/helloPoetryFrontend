import type { RouteErrorInfo } from '@core/pages/Error';
import { isRouteErrorResponse } from 'react-router-dom';

import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
} from './getAccessDeniedMessage';

function isExpiredSessionValidationError({
	status,
	code,
	message,
}: {
	status?: number;
	code?: string;
	message?: string;
}) {
	return (
		status === 422 &&
		code === 'VALIDATION' &&
		Boolean(message?.toLowerCase().includes('validation failed'))
	);
}

function getAuthErrorInfo(
	status: number,
	code?: string,
	message?: string,
	isRouteResponse = false,
): RouteErrorInfo | null {
	if (status === 401) {
		if (message?.toLowerCase().includes('banned')) {
			return {
				status: 401,
				code,
				message: getBannedPrivilegeMessage(),
				description: 'Please use a different account or contact support if this seems incorrect.',
				recoveryTo: '/login',
				recoveryLabel: 'Go to sign in',
			};
		}
		return {
			status: 401,
			code,
			message: 'Your session has expired.',
			description: 'Please sign in again to continue.',
			recoveryTo: '/login',
			recoveryLabel: 'Sign in again',
		};
	}

	if (status === 403) {
		return {
			status: 403,
			code,
			message: getAccessDeniedMessage({
				fallback: isRouteResponse
					? 'You do not have permission to access this page.'
					: 'Access denied for this action.',
				bannedMessage: getBannedPrivilegeMessage(),
				suspendedMessage: getSuspendedPrivilegeMessage(),
			}),
			description: getAccessDeniedMessage({
				fallback: isRouteResponse
					? 'Try with another account or go back to the home page.'
					: 'Try again with a different account.',
				bannedMessage:
					'This account cannot use authenticated areas. Please use a different account or contact support if this seems incorrect.',
				suspendedMessage:
					'You can still use available areas, such as notifications, while restricted privileges remain unavailable.',
			}),
			recoveryTo: '/',
			recoveryLabel: 'Go to home',
		};
	}

	if (isExpiredSessionValidationError({ status, code, message })) {
		return {
			status: 401,
			code,
			message: 'Your session has expired.',
			description: 'Please sign in again to continue.',
			recoveryTo: '/login',
			recoveryLabel: 'Sign in again',
		};
	}

	return null;
}

export function resolveAuthRouteError(error: unknown): RouteErrorInfo | null {
	if (isRouteErrorResponse(error)) {
		const data = error.data as { code?: string; message?: string } | undefined;
		return getAuthErrorInfo(error.status, data?.code, data?.message, true);
	}

	if (error && typeof error === 'object') {
		const appError = error as { statusCode?: number; code?: string; message?: string };
		if (typeof appError.statusCode === 'number') {
			return getAuthErrorInfo(appError.statusCode, appError.code, appError.message);
		}
	}

	return null;
}
