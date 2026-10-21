import { poems } from '@Api/poems/endpoints';
import { DynamicForm, type Field, type FieldRenderers, FormField } from '@BaseComponents';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useUnsavedChangesPrompt } from '@root/core/utils/useUnsavedChangesPrompt';
import { type ComponentType, lazy, Suspense, useDeferredValue, useMemo, useState } from 'react';
import type { Control } from 'react-hook-form';

import type { CreatePoemType } from '../../manage-poem/schemas/managePoemSchemas';
import { PoemHeader } from '../../poem/components/PoemHeader';
import { useCreatePoemForm } from '../hooks/useCreatePoemForm';
import { uploadPoemAudioFile } from '../utils/poemAudioUpload';
import {
	POEM_CONTENT_MAX_LENGTH,
	POEM_CONTENT_MIN_LENGTH,
	POEM_EXCERPT_MAX_LENGTH,
	POEM_EXCERPT_MIN_LENGTH,
	POEM_TAG_MAX_LENGTH,
	POEM_TAGS_MAX_AMOUNT,
	POEM_TITLE_MAX_LENGTH,
	POEM_TITLE_MIN_LENGTH,
} from './constants';

const LazyUserDedicationCombobox = lazy(async () => {
	const module = await import('../../../../users/public/components/UserDedicationCombobox');
	type DedicationComboboxProps = {
		control: Control<CreatePoemType>;
		name: 'toUserIds';
		error?: { message?: string };
		disabled?: boolean;
	};

	return {
		default: module.UserDedicationCombobox as unknown as ComponentType<DedicationComboboxProps>,
	};
});

const LazyMarkdownRenderer = lazy(async () => {
	const module = await import('../../../../../core/components/markdown-render/Component');
	return { default: module.MarkdownRenderer };
});

export function CreatePoemForm() {
	const [isUploadingAudio, setIsUploadingAudio] = useState(false);

	const {
		handleSubmit,
		formState: { errors, isValid, isDirty },
		onSubmit,
		isPending,
		hasPersistedPoem,
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
				await poems.updatePoemAudio.mutate({
					poemId: String(createdPoem.id),
					audioUrl,
				});

				setValue('audio', null);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Error uploading audio.';
				setError('audio', { type: 'manual', message });
				throw error;
			} finally {
				setIsUploadingAudio(false);
			}
		},
	});
	useUnsavedChangesPrompt(isDirty, isPending || isUploadingAudio);
	const preview = watch(['title', 'excerpt', 'content', 'tags', 'status']);

	const [title, excerpt, content, tags, status] = preview;
	const persistedFieldsDisabled = isPending || hasPersistedPoem;
	const deferredTitle = useDeferredValue(title ?? '');
	const deferredExcerpt = useDeferredValue(excerpt ?? '');
	const deferredContent = useDeferredValue(content ?? '');
	const deferredTags = useDeferredValue(tags ?? []);
	const deferredStatus = useDeferredValue(status ?? 'draft');

	const previewPoem = useMemo(
		() => ({
			title: deferredTitle || 'Poem title',
			excerpt: deferredExcerpt || '',
			content: deferredContent || '',
			tags: deferredTags || [],
			status: deferredStatus || 'draft',
			createdAt: new Date().toISOString(),
		}),
		[deferredContent, deferredExcerpt, deferredStatus, deferredTags, deferredTitle],
	);

	const isEmptyPreview = !deferredTitle && !deferredExcerpt && !deferredContent;

	const fields: Field<CreatePoemType>[] = useMemo(
		() => [
			{
				name: 'title',
				label: 'Title',
				disabled: persistedFieldsDisabled,
				required: true,
				minLength: POEM_TITLE_MIN_LENGTH,
				maxLength: POEM_TITLE_MAX_LENGTH,
				showCharacterCount: true,
			},
			{
				name: 'excerpt',
				label: 'Summary',
				disabled: persistedFieldsDisabled,
				required: true,
				type: 'textarea',
				rows: 3,
				minLength: POEM_EXCERPT_MIN_LENGTH,
				maxLength: POEM_EXCERPT_MAX_LENGTH,
				showCharacterCount: true,
			},
			{
				kind: 'custom',
				id: 'content-preview',
				render: ({ control, errors, setError, clearErrors }) => (
					<VStack w='full' align='stretch' gap={4}>
						<FormField<CreatePoemType>
							name='content'
							label='Content (Markdown)'
							control={control}
							error={errors.content}
							required
							as='textarea'
							rows={12}
							disabled={persistedFieldsDisabled}
							minLength={POEM_CONTENT_MIN_LENGTH}
							maxLength={POEM_CONTENT_MAX_LENGTH}
							showCharacterCount
							setError={setError}
							clearErrors={clearErrors}
						/>
						<Box
							as='section'
							aria-label='Poem preview'
							w='full'
							p={{ base: 3, md: 4 }}
							border='1px solid'
							borderColor='purple.700'
							borderRadius='lg'
							bg='rgba(255, 255, 255, 0.025)'
						>
							<Heading as='h2' textStyle='h4' mb={3}>
								Preview
							</Heading>
							{isEmptyPreview ? (
								<Text textStyle='smaller' color='pink.200'>
									Fill out the form to see the poem preview
								</Text>
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
										}}
									/>
									<Suspense
										fallback={
											<Text mt={4} textStyle='smaller' color='pink.200'>
												Loading preview...
											</Text>
										}
									>
										<Box
											as='article'
											mt={4}
											w='full'
											maxW='65ch'
											mx='auto'
											whiteSpace='pre-wrap'
											wordBreak='break-word'
											textStyle='small'
											css={{
												'& pre, & table': {
													maxWidth: '100%',
													overflowX: 'auto',
												},
											}}
										>
											<LazyMarkdownRenderer content={previewPoem.content} />
										</Box>
									</Suspense>
								</>
							)}
						</Box>
					</VStack>
				),
			},
			{
				kind: 'tags',
				name: 'tags',
				label: 'Tags',
				disabled: persistedFieldsDisabled,
				maxTags: POEM_TAGS_MAX_AMOUNT,
				maxTagLength: POEM_TAG_MAX_LENGTH,
				placeholder: 'Add your tags',
			},
			{
				kind: 'select',
				name: 'status',
				label: 'Status',
				disabled: persistedFieldsDisabled,
				options: [
					{ value: 'draft', label: 'Draft' },
					{ value: 'published', label: 'Published' },
				],
			},
			{
				kind: 'select',
				name: 'visibility',
				label: 'Visibility',
				disabled: persistedFieldsDisabled,
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
				disabled: persistedFieldsDisabled,
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
		],
		[isEmptyPreview, isPending, isUploadingAudio, persistedFieldsDisabled, previewPoem],
	);

	const dedicationRenderer: NonNullable<FieldRenderers<CreatePoemType>['dedication']> = ({
		control,
		errors,
	}) => (
		<Suspense
			fallback={
				<Text textStyle='smaller' color='pink.200'>
					Load users only when needed.
				</Text>
			}
		>
			<LazyUserDedicationCombobox
				name='toUserIds'
				control={control}
				error={errors.toUserIds}
				disabled={persistedFieldsDisabled}
			/>
		</Suspense>
	);

	const renderers: FieldRenderers<CreatePoemType> = {
		dedication: dedicationRenderer,
	};

	return (
		<>
			<DynamicForm<CreatePoemType>
				fields={fields}
				control={control}
				errors={errors}
				isValid={isValid || hasPersistedPoem}
				loading={isPending || isUploadingAudio}
				generalError={generalError}
				onSubmit={onSubmit}
				handleSubmitFn={handleSubmit}
				buttonLabel={hasPersistedPoem ? 'Retry audio upload' : 'Create Poem'}
				buttonVariant='surface'
				cardProps={{ w: 'full', maxW: '3xl', gap: 2 }}
				renderers={renderers}
			/>
		</>
	);
}
