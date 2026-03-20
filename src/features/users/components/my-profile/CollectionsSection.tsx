import { useMemo } from 'react';
import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@root/core/base';
import { type PoemMinimalDataType } from '@root/features/poems';
import type { CollectionsSectionProps } from './types';
import { CreateCollectionForm } from './CreateCollectionForm';
import { CollectionCard } from './CollectionCard';

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
				<CreateCollectionForm
					userId={profile.id}
					isUpdatingCollections={isUpdatingCollections}
					onCreateCollection={onCreateCollection}
				/>
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
					<CollectionCard
						key={collection.id}
						collection={collection}
						showManagementControls={showManagementControls}
						myPoems={myPoems}
						savedPoems={savedPoems}
						availablePoems={availablePoems}
						isUpdatingCollections={isUpdatingCollections}
						onDeleteCollection={onDeleteCollection}
						onAddPoemToCollection={onAddPoemToCollection}
						onRemovePoemFromCollection={onRemovePoemFromCollection}
					/>
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
