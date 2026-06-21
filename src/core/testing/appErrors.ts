import type { AppErrorType } from '@Utils';

export const bannedAccessError = {
	statusCode: 401,
	message: 'Client is banned',
	code: 'UNAUTHORIZED',
} satisfies AppErrorType;
