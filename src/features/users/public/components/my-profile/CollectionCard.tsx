import { Box, Flex, IconButton, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { PoemCombobox } from '@features/poems/public/components/PoemCombobox';
import type {
	FullPoemType,
	PoemCollectionType,
	PoemMinimalDataType,
	SavedPoemType,
} from '@features/poems/public/types';
import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';

type AddPoemFormValues = {
	poemId?: number;
};

type AddPoemToCollectionFormProps = {
	collectionId: number;
	poems: PoemMinimalDataType[];
	isAddingPoem: (poemId?: number) => boolean;
	onAddPoemToCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
};

function AddPoemToCollectionForm({
	collectionId,
	poems,
	isAddingPoem,
	onAddPoemToCollection,
}: AddPoemToCollectionFormProps) {
	const [comboboxKey, setComboboxKey] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
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
				if (!values.poemId || isSubmitting) return;
				setIsSubmitting(true);
				let didSucceed = false;
				try {
					await onAddPoemToCollection({
						collectionId,
						poemId: values.poemId,
					});
					didSucceed = true;
				} finally {
					setIsSubmitting(false);
					if (didSucceed) {
						form.reset({ poemId: undefined });
						setComboboxKey((prev) => prev + 1);
					}
				}
			})}
		>
			<Box flex='1'>
				<PoemCombobox key={comboboxKey} control={form.control} poems={poems} name='poemId' />
			</Box>
			<IconButton
				type='submit'
				aria-label='Add poem to collection'
				size={{ base: 'xs', md: 'sm' }}
				variant='solidPink'
				loading={isSubmitting || isAddingPoem(selectedPoemId)}
				disabled={!selectedPoemId || isSubmitting || isAddingPoem(selectedPoemId)}
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
	isDeletingCollection: (collectionId: number) => boolean;
	isAddingCollectionItem: (collectionId: number, poemId: number) => boolean;
	isRemovingCollectionItem: (collectionId: number, poemId: number) => boolean;
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
	isDeletingCollection,
	isAddingCollectionItem,
	isRemovingCollectionItem,
	onDeleteCollection,
	onAddPoemToCollection,
	onRemovePoemFromCollection,
}: CollectionCardProps) {
	const resolvePoem = (poemId: number) =>
		myPoems.find((item) => item.id === poemId) ?? savedPoems.find((item) => item.id === poemId);
	const [removingCollection, setRemovingCollection] = useState(false);
	const [removingPoemIds, setRemovingPoemIds] = useState<Set<number>>(new Set());

	const removingPoems = useMemo(() => new Set(removingPoemIds), [removingPoemIds]);

	useEffect(() => {
		if (!removingCollection) return;
		if (isDeletingCollection(collection.id)) return;
		setRemovingCollection(false);
	}, [collection.id, isDeletingCollection, removingCollection]);

	useEffect(() => {
		if (removingPoemIds.size === 0) return;
		const stillPresent = new Set(collection.poemIds);
		removingPoemIds.forEach((poemId) => {
			if (stillPresent.has(poemId)) return;
			window.setTimeout(() => {
				setRemovingPoemIds((prev) => {
					if (!prev.has(poemId)) return prev;
					const next = new Set(prev);
					next.delete(poemId);
					return next;
				});
			}, 220);
		});
	}, [collection.poemIds, removingPoemIds.size]);

	return (
		<Box
			borderColor='purple.700'
			borderRadius='md'
			position='relative'
			opacity={removingCollection ? 0.4 : 1}
			transform={removingCollection ? 'scale(0.98)' : undefined}
			transition='opacity 0.18s ease, transform 0.18s ease'
		>
			<Flex
				align={{ base: 'start', md: 'center' }}
				justify='space-between'
				direction={{ base: 'column', md: 'row' }}
				gap={3}
				mb={3}
				w='5/6'
			>
				<Flex direction='column' gap={1}>
					<Text textStyle='md'>{collection.name}</Text>
					<Text textStyle='smaller' color='pink.200' mt={1}>
						{collection.description || 'No description.'}
					</Text>
					<Text textStyle='smaller' color='pink.400' fontWeight='semibold'>
						{collection.poemIds.length} Poems
					</Text>
				</Flex>
				{showManagementControls && (
					<IconButton
						aria-label='Delete collection'
						size={{ base: 'xs', md: 'sm' }}
						variant='solidPink'
						colorPalette='gray'
						loading={isDeletingCollection(collection.id)}
						position='absolute'
						top={0}
						right={0}
						onClick={() => {
							if (removingCollection) return;
							setRemovingCollection(true);
							window.setTimeout(() => {
								void onDeleteCollection(collection.id);
							}, 180);
						}}
					>
						<Trash2 />
					</IconButton>
				)}
			</Flex>

			<Flex direction='column' gap={2} mb={3}>
				{Array.from(new Set([...collection.poemIds, ...removingPoemIds])).map((poemId) => {
					const poem = resolvePoem(poemId);
					const isRemoving =
						isRemovingCollectionItem(collection.id, poemId) || removingPoems.has(poemId);
					return (
						<LinkBox
							key={`${collection.id}-${poemId}`}
							display='flex'
							alignItems={{ base: 'start', md: 'center' }}
							justifyContent='space-between'
							flexDirection={{ base: 'column', md: 'row' }}
							gap={2}
							p={2}
							pb={8}
							overflow='hidden'
							border='1px solid'
							borderColor='purple.800'
							borderRadius='md'
							position='relative'
							transition='background-color 0.2s ease, border-color 0.2s ease, max-height 0.2s ease, opacity 0.18s ease, transform 0.2s ease'
							_hover={{
								bg: 'rgba(255, 255, 255, 0.03)',
								borderColor: 'purple.600',
							}}
							opacity={isRemoving ? 0 : 1}
							transform={isRemoving ? 'translateY(-6px)' : undefined}
							maxH={isRemoving ? '0px' : '200px'}
						>
							<LinkOverlay asChild position='absolute' inset={0} zIndex={1}>
								<NavLink to={poem?.slug ? `/poems/${poem.slug}/${poem.id}` : `/poems/${poemId}`} />
							</LinkOverlay>
							<Box zIndex={2} pointerEvents='none' w='full'>
								<Text textStyle='smaller' color='pink.100'>
									{poem ? poem.title : `Poem #${poemId}`}
								</Text>
							</Box>
							{showManagementControls && (
								<Box
									position='absolute'
									right={2}
									bottom={2}
									zIndex={3}
									pointerEvents='auto'
								>
									<IconButton
										aria-label='Remove poem from collection'
										size={{ base: 'xs', md: 'sm' }}
										variant='solidPink'
										colorPalette='gray'
										loading={isRemoving}
										disabled={isRemoving}
										onClick={() => {
											if (isRemoving) return;
											setRemovingPoemIds((prev) => new Set(prev).add(poemId));
											void onRemovePoemFromCollection({
												collectionId: collection.id,
												poemId,
											});
										}}
									>
										<X />
									</IconButton>
								</Box>
							)}
						</LinkBox>
					);
				})}
			</Flex>

			{showManagementControls && (
				<AddPoemToCollectionForm
					collectionId={collection.id}
					poems={availablePoems}
					isAddingPoem={(poemId) =>
						typeof poemId === 'number' ? isAddingCollectionItem(collection.id, poemId) : false
					}
					onAddPoemToCollection={onAddPoemToCollection}
				/>
			)}
		</Box>
	);
}
