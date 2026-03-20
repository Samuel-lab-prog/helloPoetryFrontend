import { Text, Heading, Box } from '@chakra-ui/react';

import { useCreatePoemForm } from '../hooks/useCreatePoemForm';
import { useUsersPreview } from '@root/features/users/hooks/useUsersPreview';
import { UserDedicationCombobox } from '@root/features/users/components/UserDedicationCombobox';
import { DynamicForm, MarkdownRenderer, toaster, type Field } from '@root/core/base';
import { PoemHeader } from '../../poem/components/PoemHeader';
import { uploadPoemAudioFile } from '../utils/poemAudioUpload';
import { api } from '@root/core/api';
import { useState } from 'react';
import type { CreatePoemType } from '../../manage-poem/schemas/managePoemSchemas';
import {
	POEM_CONTENT_MAX_LENGTH,
	POEM_CONTENT_MIN_LENGTH,
	POEM_EXCERPT_MAX_LENGTH,
	POEM_EXCERPT_MIN_LENGTH,
	POEM_TAG_MAX_LENGTH,
	POEM_TAGS_MAX_AMOUNT,
	POEM_TITLE_MIN_LENGTH,
	POEM_TITLE_MAX_LENGTH,
} from './constants';

export function CreatePoemForm() {
	const [isUploadingAudio, setIsUploadingAudio] = useState(false);

	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
		control,
		watch,
		setValue,
		setError,
		clearErrors,
	} = useCreatePoemForm({
		onCreated: async (createdPoem, data) => {
			const fileToUpload = data.audio instanceof File ? data.audio : null;

			if (!fileToUpload) return;
			setIsUploadingAudio(true);
			clearErrors('audio');

			try {
				const audioUrl = await uploadPoemAudioFile(createdPoem.id, fileToUpload);
				await api.poems.updatePoemAudio.mutate({
					poemId: String(createdPoem.id),
					audioUrl,
				});

				setValue('audio', null);

				toaster.create({
					type: 'success',
					title: 'Audio saved',
					closable: true,
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Error uploading audio.';
				setError('audio', { type: 'manual', message });
			} finally {
				setIsUploadingAudio(false);
			}
		},
	});
	const { users, isLoadingUsers, isUsersError } = useUsersPreview();
	const preview = watch();

	const previewPoem = {
		title: preview?.title || 'Poem title',
		excerpt: preview?.excerpt || '',
		content: preview?.content || '',
		tags: preview?.tags || [],
		status: preview?.status || 'draft',
		createdAt: new Date().toISOString(),
	};

	const isEmptyPreview = !preview?.title && !preview?.excerpt && !preview?.content;

	const fields: Field<CreatePoemType>[] = [
		{
			name: 'title',
			label: 'Title',
			required: true,
			minLength: POEM_TITLE_MIN_LENGTH,
			maxLength: POEM_TITLE_MAX_LENGTH,
			showCharacterCount: true,
		},
		{
			name: 'excerpt',
			label: 'Summary',
			required: true,
			type: 'textarea',
			rows: 5,
			minLength: POEM_EXCERPT_MIN_LENGTH,
			maxLength: POEM_EXCERPT_MAX_LENGTH,
			showCharacterCount: true,
		},
		{
			name: 'content',
			label: 'Content (Markdown)',
			required: true,
			type: 'textarea',
			rows: 20,
			minLength: POEM_CONTENT_MIN_LENGTH,
			maxLength: POEM_CONTENT_MAX_LENGTH,
			showCharacterCount: true,
		},
		{
			kind: 'tags',
			name: 'tags',
			label: 'Tags',
			disabled: isPending,
			maxTags: POEM_TAGS_MAX_AMOUNT,
			maxTagLength: POEM_TAG_MAX_LENGTH,
			placeholder: 'Add your tags',
		},
		{
			kind: 'select',
			name: 'status',
			label: 'Status',
			options: [
				{ value: 'draft', label: 'Draft' },
				{ value: 'published', label: 'Published' },
			],
		},
		{
			kind: 'select',
			name: 'visibility',
			label: 'Visibility',
			options: [
				{ value: 'public', label: 'Public' },
				{ value: 'friends', label: 'Friends' },
				{ value: 'private', label: 'Private' },
				{ value: 'unlisted', label: 'Unlisted' },
			],
		},
		{
			kind: 'select',
			name: 'isCommentable',
			label: 'Comments',
			options: [
				{ value: 'true', label: 'Allowed' },
				{ value: 'false', label: 'Disabled' },
			],
			transformValue: (value) => value === 'true',
		},
		{
			kind: 'dedication',
			name: 'toUserIds',
		},
		{
			kind: 'audio',
			name: 'audio',
			label: 'Poem audio (optional)',
			disabled: isUploadingAudio || isPending,
		},
	];

	return (
		<>
			<DynamicForm<CreatePoemType>
				fields={fields}
				control={control}
				errors={errors}
				isValid={isValid}
				loading={isPending}
				generalError={generalError}
				onSubmit={onSubmit}
				handleSubmitFn={handleSubmit}
				buttonLabel='Create Poem'
				buttonVariant='surface'
				cardProps={{ w: 'full', maxW: '4xl', gap: 3 }}
				renderers={{
					dedication: ({ control, errors }) => (
						<>
							<UserDedicationCombobox
								name='toUserIds'
								control={control}
								users={users}
								error={errors.toUserIds}
								disabled={isPending || isLoadingUsers}
								isLoading={isLoadingUsers}
							/>
							{isUsersError && (
								<Text textStyle='small' color='red.400'>
									Error loading users for dedication.
								</Text>
							)}
						</>
					),
				}}
			/>

			<Heading as='h2' textStyle='h2' mt={12}>
				Preview
			</Heading>

			<Box as='section' maxW='4xl' w='full'>
				{isEmptyPreview ? (
					<Box textStyle='body' color='gray.500'>
						Fill out the form to see the poem preview
					</Box>
				) : (
					<>
						<PoemHeader
							poem={{
								title: previewPoem.title,
								excerpt: previewPoem.excerpt,
								tags: previewPoem.tags.map((tag: string, index: number) => ({
									id: index,
									name: tag,
								})),
								createdAt: previewPoem.createdAt,
								updatedAt: previewPoem.createdAt,
							}}
						/>

						<Box
							as='article'
							textAlign='justify'
							mt={50}
							whiteSpace='pre-wrap'
							wordBreak='break-word'
							textStyle='small'
						>
							<MarkdownRenderer content={previewPoem.content} />
						</Box>
					</>
				)}

				<Box
					mt={8}
					w='full'
					justifyContent={['end', undefined, undefined, 'center']}
					display='flex'
				></Box>
			</Box>
		</>
	);
}
