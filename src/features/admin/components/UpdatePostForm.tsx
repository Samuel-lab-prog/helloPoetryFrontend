import { Flex, Button, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useUpdatePostForm } from '../hooks/useUpdatePostForm';
import { usePostsMinimal } from '../hooks/usePostsMinimal';
import { usePost, PostCombobox } from '@features/posts';
import { FormField, SelectField, TagsField } from '@features/base';

export function UpdatePostForm() {
	const { poems } = usePostsMinimal();

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
	} = useUpdatePostForm();

	const postId = watch('id');
	const { poem, isLoading } = usePost(postId);

	useEffect(() => {
		if (!poem) return;
		reset({
			id: poem.id,
			title: poem.title,
			excerpt: poem.excerpt,
			content: poem.content,
			status: poem.status,
			visibility: poem.visibility,
			isCommentable: poem.isCommentable,
			tags: poem.tags?.flatMap((tag) => tag.name),
		});
	}, [poem, reset]);

	return (
		<Flex
			as='form'
			w='full'
			direction='column'
			gap={6}
			onSubmit={handleSubmit(onSubmit)}
		>
			{generalError && <Text color='red.500'>{generalError}</Text>}

			<PostCombobox name='id' control={control} poems={poems} />

			<FormField
				label='Titulo'
				control={control}
				name='title'
				error={errors.title}
				required
				disabled={isLoading || !postId}
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
				disabled={isLoading || !postId}
			/>

			<SelectField
				label='Visibilidade'
				name='visibility'
				control={control}
				options={[
					{ value: 'public', label: 'Publico' },
					{ value: 'friends', label: 'Amigos' },
					{ value: 'private', label: 'Privado' },
					{ value: 'unlisted', label: 'Nao listado' },
				]}
				error={errors.visibility}
				required
				disabled={isLoading || !postId}
			/>

			<SelectField
				label='Comentarios'
				name='isCommentable'
				control={control}
				options={[
					{ value: 'true', label: 'Permitidos' },
					{ value: 'false', label: 'Desativados' },
				]}
				transformValue={(value) => value === 'true'}
				error={errors.isCommentable}
				required
				disabled={isLoading || !postId}
			/>

			<FormField
				label='Resumo'
				as='textarea'
				rows={5}
				control={control}
				name='excerpt'
				error={errors.excerpt}
				required
				disabled={isLoading || !postId}
			/>

			<FormField
				label='Conteudo (Markdown)'
				as='textarea'
				rows={20}
				control={control}
				name='content'
				error={errors.content}
				required
				disabled={isLoading || !postId}
			/>

			<TagsField
				label='Tags'
				control={control}
				name='tags'
				error={errors.tags}
				disabled={isLoading || !postId}
				placeholder='Adicione suas tags'
			/>

			<Button
				type='submit'
				variant='surface'
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
