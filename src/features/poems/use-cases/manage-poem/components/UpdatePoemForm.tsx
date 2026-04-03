import { FormField, SelectField, TagsField } from '@BaseComponents';
import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';

import { PoemCombobox } from '../../../public/components/PoemCombobox';
import { usePoemsMinimal } from '../../../public/hooks/useGetPoemsMinimal';
import { POEM_TAG_MAX_LENGTH, POEM_TAGS_MAX_AMOUNT } from '../../create-poem/components/constants';
import { usePoem } from '../../poem/hooks/usePoem';
import { useUpdatePoemForm } from '../hooks/update-poem-form';

export function UpdatePoemForm() {
	const { poems } = usePoemsMinimal();

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
	} = useUpdatePoemForm();

	const poemId = watch('id');
	const { poem, isLoading } = usePoem(poemId);

	useEffect(() => {
		if (!poem) return;
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
	}, [poem, reset]);

	return (
		<Flex as='form' w='full' direction='column' gap={6} onSubmit={handleSubmit(onSubmit)}>
			{generalError && <Text color='red.500'>{generalError}</Text>}

			<PoemCombobox name='id' control={control} poems={poems} />

			<FormField
				label='Title'
				control={control}
				name='title'
				error={errors.title}
				required
				disabled={isLoading || !poemId}
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
				disabled={isLoading || !poemId}
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
				disabled={isLoading || !poemId}
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
				disabled={isLoading || !poemId}
			/>

			<FormField
				label='Summary'
				as='textarea'
				rows={5}
				control={control}
				name='excerpt'
				error={errors.excerpt}
				required
				disabled={isLoading || !poemId}
			/>

			<FormField
				label='Content (Markdown)'
				as='textarea'
				rows={20}
				control={control}
				name='content'
				error={errors.content}
				required
				disabled={isLoading || !poemId}
			/>

			<TagsField
				label='Tags'
				control={control}
				name='tags'
				error={errors.tags}
				disabled={isLoading || !poemId}
				maxTags={POEM_TAGS_MAX_AMOUNT}
				maxTagLength={POEM_TAG_MAX_LENGTH}
				placeholder='Add your tags'
			/>

			<Button
				type='submit'
				variant='solidPink'
				colorPalette='gray'
				disabled={!isValid || isPending || isLoading}
				loading={isPending}
				w='full'
				mt={4}
			>
				Update Poem
			</Button>
		</Flex>
	);
}
