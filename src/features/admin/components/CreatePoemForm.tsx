import { Text, Heading, Box } from '@chakra-ui/react';

import { useCreatePoemForm } from '../hooks/useCreatePoemForm';
import { useUsersPreview } from '../hooks/useUsersPreview';
import {
	FormField,
	SelectField,
	TagsField,
	MarkdownRenderer,
	FieldContainer,
	FormButton,
	FormCard,
} from '@features/base';
import { PoemHeader } from '@features/poems';
import { UserDedicationCombobox } from './UserDedicationCombobox';

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

	const previewPoem = {
		title: preview?.title || 'Título do poema',
		excerpt: preview?.excerpt || '',
		content: preview?.content || '',
		tags: preview?.tags || [],
		status: preview?.status || 'draft',
		createdAt: new Date().toISOString(),
	};

	const isEmptyPreview = !preview?.title && !preview?.excerpt && !preview?.content;

	return (
		<>
			<FormCard
				as='form'
				w='full'
				maxW='4xl'
				direction='column'
				gap={3}
				onSubmit={handleSubmit(onSubmit)}
			>
				{generalError && <Text color='red.500'>{generalError}</Text>}

				<FieldContainer delay={40} hasError={!!errors.title}>
					<FormField label='Título' required error={errors.title} control={control} name='title' />
				</FieldContainer>

				<FieldContainer delay={120} hasError={!!errors.excerpt}>
					<FormField
						label='Resumo'
						required
						as='textarea'
						rows={5}
						control={control}
						name='excerpt'
						error={errors.excerpt}
					/>
				</FieldContainer>

				<FieldContainer delay={200} hasError={!!errors.content}>
					<FormField
						label='Conteúdo (Markdown)'
						required
						as='textarea'
						rows={20}
						control={control}
						name='content'
						error={errors.content}
					/>
				</FieldContainer>

				<FieldContainer delay={280} hasError={!!errors.tags}>
					<TagsField
						label='Tags'
						control={control}
						name='tags'
						error={errors.tags}
						disabled={isPending}
						placeholder='Adicione suas tags'
					/>
				</FieldContainer>

				<FieldContainer delay={360} hasError={!!errors.status}>
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
				</FieldContainer>

				<FieldContainer delay={440} hasError={!!errors.visibility}>
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
				</FieldContainer>

				<FieldContainer delay={520} hasError={!!errors.isCommentable}>
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
				</FieldContainer>

				<FieldContainer delay={600} hasError={!!errors.toUserIds}>
					<UserDedicationCombobox
						name='toUserIds'
						control={control}
						users={users}
						error={errors.toUserIds}
						disabled={isPending || isLoadingUsers}
						isLoading={isLoadingUsers}
					/>
				</FieldContainer>
				{isUsersError && (
					<Text textStyle='small' color='red.400'>
						Erro ao carregar usuários para dedicação.
					</Text>
				)}

				<FormButton isValid={isValid} loading={isPending} variant='surface'>
					Criar Poema
				</FormButton>
			</FormCard>

			<Heading as='h2' textStyle='h2' mt={12}>
				Pré-visualização
			</Heading>

			<Box as='section' maxW='4xl' w='full'>
				{isEmptyPreview ? (
					<Box textStyle='body' color='gray.500'>
						Preencha o formulário para ver a pré-visualização do poema
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
