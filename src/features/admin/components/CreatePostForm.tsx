import { Flex, Button, Text, Heading, Box } from '@chakra-ui/react';

import { useCreatePostForm } from '../hooks/useCreatePostForm';
import {
	FormField,
	SelectField,
	TagsField,
	MarkdownRenderer,
} from '@features/base';
import { PostHeader } from '@root/features/posts';

export function CreatePostForm() {
	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
		control,
		watch,
	} = useCreatePostForm();

	const preview = watch();

	const previewPost = {
		title: preview?.title || 'Título do post',
		excerpt: preview?.excerpt || '',
		content: preview?.content || '',
		tags: preview?.tags || [],
		status: preview?.status || 'draft',
		createdAt: new Date().toISOString(),
	};

	const isEmptyPreview =
		!preview?.title && !preview?.excerpt && !preview?.content;

	return (
		<>
			<Flex
				as='form'
				w='full'
				direction='column'
				gap={6}
				onSubmit={handleSubmit(onSubmit)}
			>
				{generalError && <Text color='red.500'>{generalError}</Text>}

				<FormField
					label='Título'
					required
					error={errors.title}
					control={control}
					name='title'
				/>

				<FormField
					label='Resumo'
					required
					as='textarea'
					rows={5}
					control={control}
					name='excerpt'
					error={errors.excerpt}
				/>

				<FormField
					label='Conteúdo (Markdown)'
					required
					as='textarea'
					rows={20}
					control={control}
					name='content'
					error={errors.content}
				/>

				<TagsField
					label='Tags'
					control={control}
					name='tags'
					error={errors.tags}
					disabled={isPending}
					placeholder='Adicione suas tags'
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
				/>

				<Button
					variant='surface'
					type='submit'
					disabled={!isValid}
					loading={isPending}
					w='full'
					mt={4}
				>
					Criar Post
				</Button>
			</Flex>

			<Heading
				as='h2'
				textStyle='h2'
				mt={12}
			>
				Preview
			</Heading>

			<Box
				as='section'
				maxW='4xl'
				w='full'
			>
				{isEmptyPreview ? (
					<Box
						textStyle='body'
						color='gray.500'
					>
						Preencha o formulário para visualizar o preview do post
					</Box>
				) : (
					<>
						<PostHeader
							post={{
								title: previewPost.title,
								excerpt: previewPost.excerpt,
								tags: previewPost.tags.map((tag: string, index: number) => ({
									id: index,
									name: tag,
								})),
								createdAt: previewPost.createdAt,
								updatedAt: previewPost.createdAt,
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
							<MarkdownRenderer content={previewPost.content} />
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
