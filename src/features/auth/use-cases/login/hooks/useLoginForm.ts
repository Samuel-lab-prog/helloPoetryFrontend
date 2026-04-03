import { eventBus } from '@core/events/eventBus';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { auth } from '../../../api/endpoints';
import { type AuthClient } from '../../../api/types';
import { useAuthClientStore } from '../../../public/stores/useAuthClientStore';
import { type LoginDataType, loginSchema } from '../schemas/loginSchema';

const FEED_ROUTE = '/';

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

			void eventBus.publish('userLoggedIn', {
				userId: client.id,
				role: client.role,
				status: client.status,
				loggedInAt: new Date().toISOString(),
			});
			navigate(FEED_ROUTE, { replace: true });
		},

		onError: (err: unknown) => {
			handleLoginError(err, form.setError, setGeneralError);
		},
	});

	function onSubmit(data: LoginDataType) {
		setGeneralError('');
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
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = error?.message.toLocaleLowerCase();

	if (status === 401) {
		setError('email', {
			type: 'manual',
			message: 'Incorrect credentials',
		});
		setError('password', {
			type: 'manual',
			message: 'Incorrect credentials',
		});
		return;
	}

	if (status === 403) {
		if (message.includes('not active') || message.includes('inactive')) {
			setGeneralError('Your account is not active.');
			return;
		}

		setGeneralError('You do not have permission to access.');
		return;
	}

	if (status === 422) {
		setGeneralError('Invalid login data. Review the fields.');
		return;
	}

	if (status === 429) {
		setGeneralError('Too many attempts. Please try again later.');
		return;
	}

	setGeneralError('Network error, please try again.');
}
