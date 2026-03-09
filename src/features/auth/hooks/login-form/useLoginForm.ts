import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { createHTTPRequest } from '@features/base';
import { type AuthClient } from '@root/core/stores/useAuthClientStore';
import { loginSchema, type LoginDataType } from '../../schemas/loginSchema';
import { eventBus } from '@root/core/events/eventBus';
import { handleLoginError } from './handleLoginError';

const FEED_ROUTE = '/';

export function useLoginForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<LoginDataType>({
		resolver: zodResolver(loginSchema),
		mode: 'onChange',
	});

	const loginMutation = useMutation({
		mutationFn: (data: LoginDataType) =>
			createHTTPRequest<AuthClient, LoginDataType>({
				path: '/auth/login',
				method: 'POST',
				body: data,
			}),

		onSuccess: async (client) => {
			await eventBus.publish('userLoggedIn', {
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
