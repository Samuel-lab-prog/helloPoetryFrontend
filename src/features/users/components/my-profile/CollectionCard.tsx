import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { PoemCombobox } from '@root/features/poems/public/components/PoemCombobox';
import type {
	FullPoemType,
	PoemCollectionType,
	PoemMinimalDataType,
	SavedPoemType,
} from '@root/features/poems/types';
import { ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';

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
				aria-label='Add poem to collection'
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

type CollectionCardProps = {
	collection: PoemCollectionType;
	showManagementControls: boolean;
	myPoems: FullPoemType[];
	savedPoems: SavedPoemType[];
	availablePoems: PoemMinimalDataType[];
	isUpdatingCollections: boolean;
	onDeleteCollection: (collectionId: number) => Promise<void>;
	onAddPoemToCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
	onRemovePoemFromCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
};

export function CollectionCard({
	collection,
	showManagementControls,
	myPoems,
	savedPoems,
	availablePoems,
	isUpdatingCollections,
	onDeleteCollection,
	onAddPoemToCollection,
	onRemovePoemFromCollection,
}: CollectionCardProps) {
	const resolvePoem = (poemId: number) =>
		myPoems.find((item) => item.id === poemId) ?? savedPoems.find((item) => item.id === poemId);

	return (
		<Box p={4} border='1px solid' borderColor='purple.700' borderRadius='md'>
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
						{collection.description || 'No description.'}
					</Text>
					<Text textStyle='smaller' color='pink.200'>
						{collection.poemIds.length} poems
					</Text>
				</Flex>
				{showManagementControls && (
					<IconButton
						aria-label='Delete collection'
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
						No poems in this collection.
					</Text>
				)}
				{collection.poemIds.map((poemId) => {
					const poem = resolvePoem(poemId);
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
								{poem ? poem.title : `Poem #${poemId}`}
							</Text>
							{showManagementControls && (
								<Flex gap={2}>
									{poem?.slug && (
										<IconButton
											aria-label='Open poem'
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
										aria-label='Remove poem from collection'
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
	);
}
