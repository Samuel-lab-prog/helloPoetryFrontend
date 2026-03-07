import { Flex, Button, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useUpdatePostForm } from '../hooks/useUpdatePostForm';
import { usePostsMinimal } from '../hooks/usePostsMinimal';
import { usePost, PostCombobox } from '@features/posts';
import { FormField, SelectField, TagsField } from '@features/base';

export function UpdatePostForm() {
	const { posts } = usePostsMinimal({ deleted: 'exclude' });

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
	const { post, isLoading } = usePost(postId);

	useEffect(() => {
		if (!post) return;
		reset({
			id: post.id,
			title: post.title,
			excerpt: post.excerpt,
			content: post.content,
			status: post.status,
			tags: post.tags?.flatMap((tag) => tag.name),
		});
	}, [post, reset]);

	return (
		<Flex
			as='form'
			w='full'
			direction='column'
			gap={6}
			onSubmit={handleSubmit(onSubmit)}
		>
			{generalError && <Text color='red.500'>{generalError}</Text>}

			<PostCombobox
				name='id'
				control={control}
				posts={posts}
			/>

			<FormField
				label='Título'
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
				label='Conteúdo (Markdown)'
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
				Atualizar Post
			</Button>
		</Flex>
	);
}
