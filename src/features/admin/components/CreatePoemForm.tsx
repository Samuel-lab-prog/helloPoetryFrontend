/* eslint-disable max-lines-per-function */
import { Flex, Button, Text, Heading, Box } from '@chakra-ui/react';
import { useMemo } from 'react';

import { useCreatePoemForm } from '../hooks/useCreatePoemForm';
import { useUsersPreview } from '../hooks/useUsersPreview';
import {
	FormField,
	SelectField,
	TagsField,
	MarkdownRenderer,
} from '@features/base';
import { PoemHeader } from '@features/poems';

export function CreatePoemForm() {
	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
		control,
		watch,
	} = useCreatePoemForm();
	const { users, isLoadingUsers, isUsersError } = useUsersPreview();

	const preview = watch();
	const dedicationOptions = useMemo(
		() =>
			users.map((user) => ({
				value: String(user.id),
				label: `@${user.nickname}`,
			})),
		[users],
	);

	const previewPoem = {
		title: preview?.title || 'Título do poema',
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

				<SelectField
					label='Visibilidade'
					name='visibility'
					control={control}
					options={[
						{ value: 'public', label: 'Público' },
						{ value: 'friends', label: 'Amigos' },
						{ value: 'private', label: 'Privado' },
						{ value: 'unlisted', label: 'Não listado' },
					]}
					error={errors.visibility}
				/>

				<SelectField
					label='Comentários'
					name='isCommentable'
					control={control}
					options={[
						{ value: 'true', label: 'Permitidos' },
						{ value: 'false', label: 'Desativados' },
					]}
					transformValue={(value) => value === 'true'}
					error={errors.isCommentable}
				/>

				<SelectField
					label='Dedicado a'
					name='toUserIds'
					control={control}
					placeholder={
						isLoadingUsers ? 'Carregando usuários...' : 'Sem dedicação'
					}
					options={[
						{ value: 'none', label: 'Sem dedicação' },
						...dedicationOptions,
					]}
					transformValue={(value) =>
						value === 'none' || value === '' ? [] : [Number(value)]
					}
					error={errors.toUserIds}
					disabled={isPending || isLoadingUsers}
				/>
				{isUsersError && (
					<Text
						textStyle='small'
						color='red.400'
					>
						Erro ao carregar usuários para dedicação.
					</Text>
				)}

				<Button
					variant='solidPink'
					type='submit'
					disabled={!isValid}
					loading={isPending}
					w='full'
					mt={4}
				>
					Criar Poema
				</Button>
			</Flex>

			<Heading
				as='h2'
				textStyle='h2'
				mt={12}
			>
				Pré-visualização
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
						Preencha o formulário para visualizar a pré-visualização do poema
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
