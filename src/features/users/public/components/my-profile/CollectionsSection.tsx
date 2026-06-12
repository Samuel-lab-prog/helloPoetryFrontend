import { Surface } from '@BaseComponents';
import { Flex, Heading, HStack, Link, Text } from '@chakra-ui/react';
import {
	type FullPoemType,
	type PoemCollectionType,
	type PoemMinimalDataType,
	type SavedPoemType,
} from '@features/poems/public/types';
import { Layers } from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';

import { CollectionCard } from './CollectionCard';
import { CreateCollectionForm } from './CreateCollectionForm';
import type { MyProfileViewModel } from './types';

export type CollectionsSectionProps = {
	profile: MyProfileViewModel;
	collections: PoemCollectionType[];
	totalCollectionsCount?: number;
	viewAllHref?: string;
	showManagementControls?: boolean;
	showCreateCollectionForm?: boolean;
	showPoems?: boolean;
	showAddPoemForm?: boolean;
	myPoems: FullPoemType[];
	savedPoems: SavedPoemType[];
	isLoadingCollections: boolean;
	isCreatingCollection: boolean;
	isDeletingCollection: (collectionId: number) => boolean;
	isAddingCollectionItem: (collectionId: number, poemId: number) => boolean;
	isRemovingCollectionItem: (collectionId: number, poemId: number) => boolean;
	collectionsError: string;
	onCreateCollection: (input: {
		userId: number;
		name: string;
		description?: string;
	}) => Promise<void>;
	onDeleteCollection: (collectionId: number) => Promise<void>;
	onAddPoemToCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
	onRemovePoemFromCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
	showHeader?: boolean;
	withSurface?: boolean;
};

export function CollectionsSection({
	profile,
	collections,
	totalCollectionsCount,
	viewAllHref,
	showManagementControls = true,
	showCreateCollectionForm = true,
	showPoems = true,
	showAddPoemForm = true,
	myPoems,
	savedPoems,
	isLoadingCollections,
	isCreatingCollection,
	isDeletingCollection,
	isAddingCollectionItem,
	isRemovingCollectionItem,
	collectionsError,
	onCreateCollection,
	onDeleteCollection,
	onAddPoemToCollection,
	onRemovePoemFromCollection,
	showHeader = true,
	withSurface = true,
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

	const content = (
		<>
			{showHeader && (
				<>
					<Flex align='center' justify='space-between' direction='row' gap={3} mb={2} w='full'>
						<HStack gap={2}>
							<Layers size={18} color='var(--chakra-colors-pink-300)' />
							<Heading as='h2' textStyle='h5' color='pink.300' textTransform='none'>
								Poem collections
							</Heading>
						</HStack>
						{viewAllHref && (
							<Link
								asChild
								textStyle='small'
								color='pink.200'
								textDecoration='underline'
								textUnderlineOffset='3px'
								flexShrink={0}
							>
								<NavLink to={viewAllHref}>View all</NavLink>
							</Link>
						)}
					</Flex>
					{viewAllHref && Boolean(totalCollectionsCount) && (
						<Text mb={4} textStyle='smaller' color='pink.200' textAlign='left'>
							Showing {collections.length} of {totalCollectionsCount} collections
						</Text>
					)}
				</>
			)}

			{showManagementControls && showCreateCollectionForm && (
				<CreateCollectionForm
					userId={profile.id}
					isCreatingCollection={isCreatingCollection}
					onCreateCollection={onCreateCollection}
				/>
			)}

			<Flex direction='column' gap={4}>
				{isLoadingCollections && <Text textStyle='small'>Loading collections...</Text>}
				{!isLoadingCollections && collections.length === 0 && (
					<Text textStyle='small'>You have not created any collections yet.</Text>
				)}
				{!showHeader && !isLoadingCollections && Boolean(totalCollectionsCount) && (
					<Text textStyle='smaller' color='pink.200'>
						Showing {collections.length} of {totalCollectionsCount} collections.
					</Text>
				)}

				{collections.map((collection) => {
					const poemIds = new Set(collection.poemIds);
					const filteredAvailablePoems = availablePoems.filter((poem) => !poemIds.has(poem.id));
					return (
						<Flex
							key={collection.id}
							direction='column'
							borderTop='2px solid'
							borderColor='purple.700'
							pt={4}
						>
							<CollectionCard
								collection={collection}
								showManagementControls={showManagementControls}
								myPoems={myPoems}
								savedPoems={savedPoems}
								availablePoems={filteredAvailablePoems}
								showPoems={showPoems}
								showAddPoemForm={showAddPoemForm}
								isDeletingCollection={isDeletingCollection}
								isAddingCollectionItem={isAddingCollectionItem}
								isRemovingCollectionItem={isRemovingCollectionItem}
								onDeleteCollection={onDeleteCollection}
								onAddPoemToCollection={onAddPoemToCollection}
								onRemovePoemFromCollection={onRemovePoemFromCollection}
							/>
						</Flex>
					);
				})}
			</Flex>

			{collectionsError && (
				<Text mt={3} textStyle='small' color='red.400'>
					{collectionsError}
				</Text>
			)}
		</>
	);

	if (!withSurface) return content;

	return (
		<Surface p={5} variant='panel'>
			{content}
		</Surface>
	);
}
