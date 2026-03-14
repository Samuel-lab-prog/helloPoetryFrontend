import { useMemo } from 'react';
import { Box, Flex, Heading, IconButton, Link, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { FormField, Surface } from '@features/base';
import { PoemCombobox, type PoemMinimalDataType } from '@features/poems';
import type { CollectionsSectionProps } from './types';

type CreateCollectionFormValues = {
	name: string;
	description: string;
};

type AddPoemFormValues = {
	poemId?: number;
};

type AddPoemToCollectionFormProps = {
	collectionId: number;
	poems: PoemMinimalDataType[];
	isUpdatingCollections: boolean;
	onAddPoemToCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
};

function AddPoemToCollectionForm({
	collectionId,
	poems,
	isUpdatingCollections,
	onAddPoemToCollection,
}: AddPoemToCollectionFormProps) {
	const form = useForm<AddPoemFormValues>({
		defaultValues: { poemId: undefined },
		mode: 'onChange',
	});
	const selectedPoemId = form.watch('poemId');

	return (
		<Flex
			as='form'
			align={{ base: 'stretch', md: 'end' }}
			direction={{ base: 'column', md: 'row' }}
			gap={2}
			onSubmit={form.handleSubmit(async (values) => {
				if (!values.poemId) return;
				await onAddPoemToCollection({
					collectionId,
					poemId: values.poemId,
				});
				form.reset({ poemId: undefined });
			})}
		>
			<Box flex='1'>
				<PoemCombobox control={form.control} poems={poems} name='poemId' />
			</Box>
			<IconButton
				type='submit'
				aria-label='Adicionar poema a colecao'
				size={{ base: 'xs', md: 'sm' }}
				variant='solidPink'
				loading={isUpdatingCollections}
				disabled={!selectedPoemId || isUpdatingCollections}
			>
				<Plus />
			</IconButton>
		</Flex>
	);
}

export function CollectionsSection({
	profile,
	collections,
	totalCollectionsCount,
	viewAllHref,
	showManagementControls = true,
	myPoems,
	savedPoems,
	isLoadingCollections,
	isUpdatingCollections,
	collectionsError,
	onCreateCollection,
	onDeleteCollection,
	onAddPoemToCollection,
	onRemovePoemFromCollection,
}: CollectionsSectionProps) {
	const createCollectionForm = useForm<CreateCollectionFormValues>({
		defaultValues: {
			name: '',
			description: '',
		},
		mode: 'onChange',
	});
	const collectionName = createCollectionForm.watch('name');

	const availablePoems = useMemo<PoemMinimalDataType[]>(() => {
		const items = [...myPoems, ...savedPoems];
		const uniqueById = new Map<number, PoemMinimalDataType>();
		items.forEach((poem) => {
			if (!uniqueById.has(poem.id)) {
				uniqueById.set(poem.id, {
					id: poem.id,
					title: poem.title,
				});
			}
		});
		return Array.from(uniqueById.values());
	}, [myPoems, savedPoems]);

	return (
		<Surface p={5} variant='panel'>
			<Flex
				align={{ base: 'start', md: 'center' }}
				justify='space-between'
				direction={{ base: 'column', md: 'row' }}
				gap={3}
				mb={4}
			>
				<Heading as='h2' textStyle='h4' color='pink.300'>
					Colecoes de poemas
				</Heading>
				{viewAllHref && (
					<Link
						asChild
						textStyle='small'
						color='pink.200'
						textDecoration='underline'
						textUnderlineOffset='3px'
					>
						<NavLink to={viewAllHref}>Ver todas</NavLink>
					</Link>
				)}
			</Flex>

			{showManagementControls && (
				<Flex
					as='form'
					direction='column'
					gap={3}
					mb={5}
					onSubmit={createCollectionForm.handleSubmit(async (values) => {
						const name = values.name.trim();
						if (!name) return;

						await onCreateCollection({
							userId: profile.id,
							name,
							description: values.description.trim(),
						});

						createCollectionForm.reset({
							name: '',
							description: '',
						});
					})}
				>
					<FormField
						control={createCollectionForm.control}
						name='name'
						label='Nome da colecao'
						required
					/>
					<FormField
						control={createCollectionForm.control}
						name='description'
						label='Descricao da colecao'
						as='textarea'
						rows={3}
					/>
					<IconButton
						type='submit'
						aria-label='Criar colecao'
						size={{ base: 'xs', md: 'sm' }}
						variant='solidPink'
						loading={isUpdatingCollections}
						disabled={!collectionName?.trim() || isUpdatingCollections}
						alignSelf='start'
					>
						<Plus />
					</IconButton>
				</Flex>
			)}

			<Flex direction='column' gap={4}>
				{isLoadingCollections && <Text textStyle='small'>Carregando colecoes...</Text>}
				{!isLoadingCollections && collections.length === 0 && (
					<Text textStyle='small'>Voce ainda nao criou colecoes.</Text>
				)}
				{!isLoadingCollections && Boolean(totalCollectionsCount) && (
					<Text textStyle='smaller' color='pink.200'>
						Mostrando {collections.length} de {totalCollectionsCount} colecoes.
					</Text>
				)}

				{collections.map((collection) => (
					<Box
						key={collection.id}
						p={4}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<Flex
							align={{ base: 'start', md: 'center' }}
							justify='space-between'
							direction={{ base: 'column', md: 'row' }}
							gap={3}
							mb={3}
						>
							<Flex direction='column' gap={1}>
								<Text textStyle='small'>{collection.name}</Text>
								<Text textStyle='smaller' color='pink.200'>
									{collection.description || 'Sem descricao.'}
								</Text>
								<Text textStyle='smaller' color='pink.200'>
									{collection.poemIds.length} poemas
								</Text>
							</Flex>
							{showManagementControls && (
								<IconButton
									aria-label='Excluir colecao'
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									colorPalette='gray'
									loading={isUpdatingCollections}
									onClick={() => {
										void onDeleteCollection(collection.id);
									}}
								>
									<Trash2 />
								</IconButton>
							)}
						</Flex>

						<Flex direction='column' gap={2} mb={3}>
							{collection.poemIds.length === 0 && (
								<Text textStyle='smaller' color='pink.200'>
									Nenhum poema nesta colecao.
								</Text>
							)}
							{collection.poemIds.map((poemId) => {
								const poem =
									myPoems.find((item) => item.id === poemId) ??
									savedPoems.find((item) => item.id === poemId);
								return (
									<Flex
										key={`${collection.id}-${poemId}`}
										align={{ base: 'start', md: 'center' }}
										justify='space-between'
										direction={{ base: 'column', md: 'row' }}
										gap={2}
										p={2}
										border='1px solid'
										borderColor='purple.800'
										borderRadius='md'
									>
										<Text textStyle='smaller' color='pink.100'>
											{poem ? poem.title : `Poema #${poemId}`}
										</Text>
										{showManagementControls && (
											<Flex gap={2}>
												{poem?.slug && (
													<IconButton
														aria-label='Abrir poema'
														size={{ base: 'xs', md: 'sm' }}
														variant='solidPink'
														asChild
													>
														<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
															<ExternalLink />
														</NavLink>
													</IconButton>
												)}
												<IconButton
													aria-label='Remover poema da colecao'
													size={{ base: 'xs', md: 'sm' }}
													variant='solidPink'
													colorPalette='gray'
													loading={isUpdatingCollections}
													onClick={() => {
														void onRemovePoemFromCollection({
															collectionId: collection.id,
															poemId,
														});
													}}
												>
													<X />
												</IconButton>
											</Flex>
										)}
									</Flex>
								);
							})}
						</Flex>

						{showManagementControls && (
							<AddPoemToCollectionForm
								collectionId={collection.id}
								poems={availablePoems}
								isUpdatingCollections={isUpdatingCollections}
								onAddPoemToCollection={onAddPoemToCollection}
							/>
						)}
					</Box>
				))}
			</Flex>

			{collectionsError && (
				<Text mt={3} textStyle='small' color='red.400'>
					{collectionsError}
				</Text>
			)}
		</Surface>
	);
}
