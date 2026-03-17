import { Flex, Button, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useUpdatePoemForm } from '../../hooks/update-poem-form';
import { usePoemsMinimal } from '../../hooks/usePoemsMinimal';
import { usePoem, PoemCombobox } from '@features/poems';
import { FormField, SelectField, TagsField } from '@root/core/base';
import { POEM_TAG_MAX_LENGTH, POEM_TAGS_MAX_AMOUNT } from '../../use-cases/create-poem/components/constants';

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
				label='T�tulo'
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
					{ value: 'draft', label: 'Rascunho' },
					{ value: 'published', label: 'Publicado' },
				]}
				error={errors.status}
				required
				disabled={isLoading || !poemId}
			/>

			<SelectField
				label='Visibilidade'
				name='visibility'
				control={control}
				options={[
					{ value: 'public', label: 'P�blico' },
					{ value: 'friends', label: 'Amigos' },
					{ value: 'private', label: 'Privado' },
					{ value: 'unlisted', label: 'N�o listado' },
				]}
				error={errors.visibility}
				required
				disabled={isLoading || !poemId}
			/>

			<SelectField
				label='Coment�rios'
				name='isCommentable'
				control={control}
				options={[
					{ value: 'true', label: 'Permitidos' },
					{ value: 'false', label: 'Desativados' },
				]}
				transformValue={(value) => value === 'true'}
				error={errors.isCommentable}
				required
				disabled={isLoading || !poemId}
			/>

			<FormField
				label='Resumo'
				as='textarea'
				rows={5}
				control={control}
				name='excerpt'
				error={errors.excerpt}
				required
				disabled={isLoading || !poemId}
			/>

			<FormField
				label='Conte�do (Markdown)'
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
				placeholder='Adicione suas tags'
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
				Atualizar Poema
			</Button>
		</Flex>
	);
}
