import { toaster } from '@BaseComponents';
import { poems } from '@features/poems/api/endpoints';
import type { CreatePoemResult } from '@features/poems/api/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventBus } from '@root/core/events/eventBus';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import { createPoemSchema, type CreatePoemType } from '../../manage-poem/schemas/managePoemSchemas';

type CreatePoemPayload = Omit<CreatePoemType, 'audio'>;

type UseCreatePoemFormOptions = {
	onCreated?: (poem: CreatePoemResult, data: CreatePoemType) => Promise<void> | void;
};

export function useCreatePoemForm(options: UseCreatePoemFormOptions = {}) {
	const [generalError, setGeneralError] = useState('');

	const form = useForm<CreatePoemType>({
		resolver: zodResolver(createPoemSchema),
		mode: 'onChange',
		defaultValues: {
			excerpt: '',
			status: 'draft',
			visibility: 'public',
			isCommentable: true,
			tags: [],
			toUserIds: [],
			audio: null,
		},
	});

	const { mutateAsync, isPending } = useCreatePoem();

	async function onSubmit(data: CreatePoemType) {
		setGeneralError('');

		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { audio, ...rest } = data;
			const createdPoem = await mutateAsync(rest as CreatePoemPayload);
			if (options.onCreated) {
				await options.onCreated(createdPoem, data);
			}
			void eventBus.publish('poemCreated', {
				poemId: createdPoem.id,
				createdAt: new Date().toISOString(),
			});
			toaster.create({
				type: 'success',
				title: 'Poem created',
				description: 'Your poem has been created and will be reviewed for moderation.',
				duration: 6000,
				meta: {
					colorPalette: 'purple',
				},
				closable: true,
			});
		} catch (err) {
			handleCreatePoemError(err, form.setError, setGeneralError);
		}
	}

	return {
		handleSubmit: form.handleSubmit,
		reset: form.reset,
		formState: form.formState,
		control: form.control,
		watch: form.watch,
		setValue: form.setValue,
		setError: form.setError,
		clearErrors: form.clearErrors,
		onSubmit,
		isPending,
		generalError,
	};
}

function useCreatePoem() {
	return useMutation({
		mutationFn: (newPoem: CreatePoemPayload) => poems.createPoem.mutate(newPoem),
	});
}

export function handleCreatePoemError(
	err: unknown,
	setError: UseFormSetError<CreatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const lowerMessage = error?.message?.toLowerCase();

	if (status === 401) {
		setGeneralError('You do not have permission to create poems.');
		return;
	}

	if (status === 403) {
		if (lowerMessage.includes('assign or mention themselves')) {
			setError('toUserIds', {
				type: 'manual',
				message: 'You cannot dedicate the poem to yourself.',
			});
			return;
		}

		if (lowerMessage.includes('author is not active')) {
			setGeneralError('Your user must be active to create poems.');
			return;
		}

		setGeneralError('You do not have permission to create this poem.');
		return;
	}

	if (status === 409) {
		if (
			lowerMessage.includes('same title') ||
			lowerMessage.includes('slug') ||
			lowerMessage.includes('title')
		) {
			setError('title', {
				type: 'manual',
				message: 'You already have a poem with this title.',
			});
			return;
		}

		setGeneralError('Conflict while creating the poem. Review the data and try again.');
		return;
	}

	if (status === 422) {
		if (mapCreatePoemValidationError(lowerMessage, setError)) return;
		setGeneralError('Invalid data. Check the fields and try again.');
		return;
	}

	setGeneralError('Error creating the poem. Please try again later.');
}

function mapCreatePoemValidationError(
	lowerMessage: string,
	setError: UseFormSetError<CreatePoemType>,
) {
	if (!lowerMessage) return false;

	if (lowerMessage.includes('title')) {
		setError('title', { type: 'manual', message: 'Invalid title.' });
		return true;
	}

	if (lowerMessage.includes('excerpt') || lowerMessage.includes('summary')) {
		setError('excerpt', { type: 'manual', message: 'Invalid summary.' });
		return true;
	}

	if (lowerMessage.includes('content')) {
		setError('content', { type: 'manual', message: 'Invalid content.' });
		return true;
	}

	if (lowerMessage.includes('tag')) {
		setError('tags', { type: 'manual', message: 'Invalid tags.' });
		return true;
	}

	if (lowerMessage.includes('status')) {
		setError('status', { type: 'manual', message: 'Invalid status.' });
		return true;
	}

	if (lowerMessage.includes('visibility')) {
		setError('visibility', { type: 'manual', message: 'Invalid visibility.' });
		return true;
	}

	if (lowerMessage.includes('commentable') || lowerMessage.includes('comments')) {
		setError('isCommentable', {
			type: 'manual',
			message: 'Invalid comments setting.',
		});
		return true;
	}

	if (
		lowerMessage.includes('dedicated users') ||
		lowerMessage.includes('mentioned users') ||
		lowerMessage.includes('touserids') ||
		lowerMessage.includes('invalid users')
	) {
		setError('toUserIds', {
			type: 'manual',
			message: 'Select only active and valid users for dedication.',
		});
		return true;
	}

	return false;
}
