import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { createHTTPRequest, type AppErrorType } from '@features/base';
import { registerSchema, type RegisterDataType } from '../schemas/registerSchema';

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<RegisterDataType>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
	});

	const registerMutation = useMutation({
		mutationFn: (data: RegisterDataType) =>
			createHTTPRequest<void, RegisterDataType>({
				path: '/users',
				method: 'POST',
				body: data,
			}),

		onSuccess: () => {
			navigate('/login');
		},

		onError: (err: unknown) => {
			const error = err as AppErrorType;

			if (error.statusCode === 409) {
				const msg = error.message?.toLowerCase() ?? '';

				if (msg.includes('nickname')) {
					form.setError('nickname', {
						type: 'manual',
						message: 'Apelido já está em uso',
					});
				}

				if (msg.includes('email')) {
					form.setError('email', {
						type: 'manual',
						message: 'E-mail já está em uso',
					});
				}

				return;
			}

			setGeneralError('Erro de rede. Tente novamente.');
		},
	});

	function onSubmit(data: RegisterDataType) {
		setGeneralError('');

		if (!form.formState.isValid) return;

		registerMutation.mutate(data);
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		formState: form.formState,
		control: form.control,
		isPending: registerMutation.isPending,
		setError: form.setError,
		clearErrors: form.clearErrors,
	};
}
