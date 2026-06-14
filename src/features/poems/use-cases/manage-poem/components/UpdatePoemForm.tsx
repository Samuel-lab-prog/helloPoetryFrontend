import { FormField, SelectField, Surface, TagsField } from '@BaseComponents';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PoemCombobox } from '../../../public/components/PoemCombobox';
import { useMyPoems } from '../../../public/hooks/useGetMyPoems';
import { canUpdatePoem } from '../../../public/utils/canUpdatePoem';
import { POEM_TAG_MAX_LENGTH, POEM_TAGS_MAX_AMOUNT } from '../../create-poem/components/constants';
import { usePoem } from '../../poem/hooks/usePoem';
import { useUpdatePoemForm } from '../hooks/update-poem-form';

export function UpdatePoemForm() {
	const { poems: myPoems } = useMyPoems();

	const {
		control,
		handleSubmit,
		watch,
		reset,
		setValue,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
	} = useUpdatePoemForm();

	const poemId = watch('id');
	const { poem, isLoading } = usePoem(poemId);
	const [searchParams] = useSearchParams();
	const initialPoemId = Number(searchParams.get('poemId') ?? '');
	const editablePoems = useMemo(() => myPoems.filter((item) => canUpdatePoem(item)), [myPoems]);
	const isEditablePoem = canUpdatePoem(poem);
	const formDisabled = isLoading || !poemId || !isEditablePoem;

	useEffect(() => {
		if (!initialPoemId || Number.isNaN(initialPoemId)) return;
		if (poemId) return;
		setValue('id', initialPoemId, { shouldValidate: true });
	}, [initialPoemId, poemId, setValue]);

	useEffect(() => {
		if (!poem || !isEditablePoem) return;
		reset({
			id: poem.id,
			title: poem.title,
			excerpt: poem.excerpt ?? undefined,
			content: poem.content,
			status: poem.status,
			visibility: poem.visibility,
			isCommentable: poem.isCommentable,
			tags: poem.tags?.flatMap((tag) => tag.name),
		});
	}, [isEditablePoem, poem, reset]);

	return (
		<Flex as='form' w='full' direction='column' gap={4} onSubmit={handleSubmit(onSubmit)}>
			{generalError && (
				<Text textStyle='smaller' color='red.400'>
					{generalError}
				</Text>
			)}

			<PoemCombobox name='id' control={control} poems={editablePoems} />

			{poem && !isEditablePoem && (
				<Surface variant='soft' p={4}>
					<Text textStyle='smaller' color='pink.100'>
						This poem cannot be edited from the admin panel anymore. Only drafts and rejected poems
						can be updated here.
					</Text>
				</Surface>
			)}

			<FormField
				label='Title'
				control={control}
				name='title'
				error={errors.title}
				required
				disabled={formDisabled}
			/>

			<SelectField
				label='Status'
				name='status'
				control={control}
				options={[
					{ value: 'draft', label: 'Draft' },
					{ value: 'published', label: 'Published' },
				]}
				error={errors.status}
				required
				disabled={formDisabled}
			/>

			<SelectField
				label='Visibility'
				name='visibility'
				control={control}
				options={[
					{ value: 'public', label: 'Public' },
					{ value: 'friends', label: 'Friends' },
					{ value: 'private', label: 'Private' },
					{ value: 'unlisted', label: 'Unlisted' },
				]}
				error={errors.visibility}
				required
				disabled={formDisabled}
			/>

			<SelectField
				label='Comments'
				name='isCommentable'
				control={control}
				options={[
					{ value: 'true', label: 'Allowed' },
					{ value: 'false', label: 'Disabled' },
				]}
				transformValue={(value) => value === 'true'}
				error={errors.isCommentable}
				required
				disabled={formDisabled}
			/>

			<FormField
				label='Summary'
				as='textarea'
				rows={5}
				control={control}
				name='excerpt'
				error={errors.excerpt}
				required
				disabled={formDisabled}
			/>

			<FormField
				label='Content (Markdown)'
				as='textarea'
				rows={20}
				control={control}
				name='content'
				error={errors.content}
				required
				disabled={formDisabled}
			/>

			<TagsField
				label='Tags'
				control={control}
				name='tags'
				error={errors.tags}
				disabled={formDisabled}
				maxTags={POEM_TAGS_MAX_AMOUNT}
				maxTagLength={POEM_TAG_MAX_LENGTH}
				placeholder='Add your tags'
			/>

			<Button
				type='submit'
				size='sm'
				variant='solidPink'
				colorPalette='gray'
				disabled={!isValid || isPending || formDisabled}
				loading={isPending}
				w={{ base: 'full', md: 'fit-content' }}
				alignSelf={{ base: 'stretch', md: 'flex-end' }}
				mt={2}
				px={6}
			>
				Update Poem
			</Button>
		</Flex>
	);
}
