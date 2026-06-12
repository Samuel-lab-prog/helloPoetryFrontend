import { poems } from '@Api/poems/endpoints';
import { DynamicForm, type Field, type FieldRenderers } from '@BaseComponents';
import { Box, Heading, Text } from '@chakra-ui/react';
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
				await poems.updatePoemAudio.mutate({
					poemId: String(createdPoem.id),
					audioUrl,
				});

				setValue('audio', null);
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Error uploading audio.';
				setError('audio', { type: 'manual', message });
			} finally {
				setIsUploadingAudio(false);
			}
		},
	});
	const preview = watch(['title', 'excerpt', 'content', 'tags', 'status']);

	const [title, excerpt, content, tags, status] = preview;
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
				rows: 3,
				minLength: POEM_EXCERPT_MIN_LENGTH,
				maxLength: POEM_EXCERPT_MAX_LENGTH,
				showCharacterCount: true,
			},
			{
				name: 'content',
				label: 'Content (Markdown)',
				required: true,
				type: 'textarea',
				rows: 8,
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
		],
		[isPending, isUploadingAudio],
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
				disabled={isPending}
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
				isValid={isValid}
				loading={isPending}
				generalError={generalError}
				onSubmit={onSubmit}
				handleSubmitFn={handleSubmit}
				buttonLabel='Create Poem'
				buttonVariant='surface'
				cardProps={{ w: 'full', maxW: '3xl', gap: 2 }}
				renderers={renderers}
			/>

			<Heading as='h2' textStyle='h4' mt={8}>
				Preview
			</Heading>

			<Box as='section' maxW='4xl' w='full'>
				{isEmptyPreview ? (
					<Box textStyle='smaller' color='gray.500'>
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

						<Suspense
							fallback={
								<Text mt={10} textStyle='smaller' color='pink.200'>
									Loading preview...
								</Text>
							}
						>
							<Box
								as='article'
								textAlign='justify'
								mt={10}
								whiteSpace='pre-wrap'
								wordBreak='break-word'
								textStyle='smaller'
							>
								<LazyMarkdownRenderer content={previewPoem.content} />
							</Box>
						</Suspense>
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
