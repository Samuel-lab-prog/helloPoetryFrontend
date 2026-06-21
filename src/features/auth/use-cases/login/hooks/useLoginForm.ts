import { auth } from '@Api/auth/endpoints';
import { type AuthClient } from '@Api/auth/types';
import { eventBus } from '@core/events/eventBus';
import { getBannedPrivilegeMessage } from '@features/auth/public';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormClearErrors, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuthClientStore } from '../../../public/stores/useAuthClientStore';
import { type LoginDataType, loginSchema } from '../schemas/loginSchema';

const FEED_ROUTE = '/';
const INVALID_CREDENTIALS_MESSAGE = 'Incorrect credentials';

type LoginErrorDisplay = { kind: 'field'; message: string } | { kind: 'general'; message: string };

export function useLoginForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<LoginDataType>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	});

	const loginMutation = useMutation({
		mutationFn: (data: LoginDataType) => auth.login.mutate(data) as Promise<AuthClient>,

		onSuccess: (client) => {
			useAuthClientStore.getState().setAuthClient({
				id: client.id,
				role: client.role,
				status: client.status,
			});

			eventBus.publish('userLoggedIn', {
				userId: client.id,
				role: client.role,
				status: client.status,
				loggedInAt: new Date().toISOString(),
			});
			navigate(FEED_ROUTE, { replace: true });
		},

		onError: (err: unknown) => {
			handleLoginError(err, form.setError, form.clearErrors, setGeneralError);
		},
	});

	function onSubmit(data: LoginDataType) {
		setGeneralError('');
		form.clearErrors(['email', 'password']);
		if (loginMutation.isPending) return;
		loginMutation.mutate(data);
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		reset: form.reset,
		formState: form.formState,
		control: form.control,
		watch: form.watch,
		isPending: loginMutation.isPending,
	};
}

function handleLoginError(
	err: unknown,
	setError: UseFormSetError<LoginDataType>,
	clearErrors: UseFormClearErrors<LoginDataType>,
	setGeneralError: (msg: string) => void,
) {
	const display = getLoginErrorDisplay(err);

	if (display.kind === 'field') {
		setError('email', {
			type: 'manual',
			message: display.message,
		});
		setError('password', {
			type: 'manual',
			message: display.message,
		});
		return;
	}

	clearErrors(['email', 'password']);
	setGeneralError(display.message);
}

function isBannedLoginMessage(message: string) {
	return message.includes('banned') || message.includes('banido') || message.includes('banida');
}

function getLoginErrorDisplay(err: unknown): LoginErrorDisplay {
	const error = err as Partial<AppErrorType>;
	const status = error?.statusCode;
	const rawMessage = typeof error?.message === 'string' ? error.message : '';
	const message = rawMessage.toLowerCase();

	if (status === 401) {
		if (isBannedLoginMessage(message)) {
			return { kind: 'general', message: getBannedPrivilegeMessage('sign in') };
		}

		if (message.includes('too many')) {
			return {
				kind: 'general',
				message: 'Too many login attempts. Please wait a moment and try again.',
			};
		}

		if (!message || message.includes('invalid credentials')) {
			return { kind: 'field', message: INVALID_CREDENTIALS_MESSAGE };
		}

		return {
			kind: 'general',
			message: "We couldn't sign you in. Please try again.",
		};
	}

	if (status === 403) {
		if (message.includes('not active') || message.includes('inactive')) {
			return { kind: 'general', message: 'Your account is not active.' };
		}

		return {
			kind: 'general',
			message: "You don't have permission to sign in.",
		};
	}

	if (status === 422) {
		return {
			kind: 'general',
			message: 'Review your login details and try again.',
		};
	}

	if (status === 429) {
		return {
			kind: 'general',
			message: 'Too many attempts. Please try again later.',
		};
	}

	return {
		kind: 'general',
		message: "We couldn't reach the server. Check your connection and try again.",
	};
}
