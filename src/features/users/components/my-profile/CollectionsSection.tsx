import { useState } from 'react';
import { Box, Button, Flex, Heading, Input, Text, Textarea } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@features/base';
import type { CollectionsSectionProps } from './types';

export function CollectionsSection({
	profile,
	collections,
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
	const [collectionNameDraft, setCollectionNameDraft] = useState('');
	const [collectionDescriptionDraft, setCollectionDescriptionDraft] = useState('');
	const [collectionPoemIdDrafts, setCollectionPoemIdDrafts] = useState<Record<number, string>>({});

	return (
		<Surface p={5} variant='panel'>
			<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
				Coleções de poemas
			</Heading>

			<Flex direction='column' gap={3} mb={5}>
				<Input
					value={collectionNameDraft}
					onChange={(event) => setCollectionNameDraft(event.target.value)}
					placeholder='Nome da coleção'
					bg='surface'
				/>
				<Textarea
					value={collectionDescriptionDraft}
					onChange={(event) => setCollectionDescriptionDraft(event.target.value)}
					placeholder='Descrição da coleção'
					rows={3}
					bg='surface'
				/>
				<Button
					size={{ base: 'xs', md: 'sm' }}
					variant='solidPink'
					loading={isUpdatingCollections}
					onClick={async () => {
						if (!collectionNameDraft.trim()) return;
						await onCreateCollection({
							userId: profile.id,
							name: collectionNameDraft.trim(),
							description: collectionDescriptionDraft.trim(),
						});
						setCollectionNameDraft('');
						setCollectionDescriptionDraft('');
					}}
				>
					Criar coleção
				</Button>
			</Flex>

			<Flex direction='column' gap={4}>
				{isLoadingCollections && <Text textStyle='small'>Carregando coleções...</Text>}
				{!isLoadingCollections && collections.length === 0 && (
					<Text textStyle='small'>Você ainda não criou coleções.</Text>
				)}

				{collections.map((collection) => (
					<Box key={collection.id} p={4} border='1px solid' borderColor='purple.700' borderRadius='md'>
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
									{collection.description || 'Sem descrição.'}
								</Text>
								<Text textStyle='smaller' color='pink.200'>
									{collection.poemIds.length} poemas
								</Text>
							</Flex>
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								colorPalette='gray'
								loading={isUpdatingCollections}
								onClick={() => {
									void onDeleteCollection(collection.id);
								}}
							>
								Excluir
							</Button>
						</Flex>

						<Flex direction='column' gap={2} mb={3}>
							{collection.poemIds.length === 0 && (
								<Text textStyle='smaller' color='pink.200'>
									Nenhum poema nesta coleção.
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
										<Flex gap={2}>
											{poem?.slug && (
												<Button size={{ base: 'xs', md: 'sm' }} variant='solidPink' asChild>
													<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Abrir</NavLink>
												</Button>
											)}
											<Button
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
												Remover
											</Button>
										</Flex>
									</Flex>
								);
							})}
						</Flex>

						<Flex
							align={{ base: 'stretch', md: 'center' }}
							direction={{ base: 'column', md: 'row' }}
							gap={2}
						>
							<Input
								value={collectionPoemIdDrafts[collection.id] ?? ''}
								onChange={(event) =>
									setCollectionPoemIdDrafts((previous) => ({
										...previous,
										[collection.id]: event.target.value,
									}))
								}
								placeholder='ID do poema'
								inputMode='numeric'
								bg='surface'
							/>
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								loading={isUpdatingCollections}
								onClick={async () => {
									const rawValue = collectionPoemIdDrafts[collection.id] ?? '';
									const poemId = Number(rawValue);
									if (!Number.isFinite(poemId) || poemId <= 0) return;
									await onAddPoemToCollection({ collectionId: collection.id, poemId });
									setCollectionPoemIdDrafts((previous) => ({
										...previous,
										[collection.id]: '',
									}));
								}}
							>
								Adicionar poema
							</Button>
						</Flex>
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
