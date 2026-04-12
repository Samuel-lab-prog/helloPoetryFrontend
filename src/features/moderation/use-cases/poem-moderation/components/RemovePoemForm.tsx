import { moderation } from '@Api/moderation/endpoints';
import { poems } from '@Api/poems/endpoints';
import { toaster } from '@BaseComponents';
import {
	Box,
	Button,
	Combobox,
	Field,
	Flex,
	Portal,
	Text,
	Textarea,
	useFilter,
	useListCollection,
	VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const SEARCH_DELAY_MS = 260;
const MIN_SEARCH_LENGTH = 2;

export function RemovePoemForm() {
	const [poemSearchTitle, setPoemSearchTitle] = useState('');
	const [debouncedPoemSearch, setDebouncedPoemSearch] = useState('');
	const [poemInputValue, setPoemInputValue] = useState('');
	const [isRemovingPoem, setIsRemovingPoem] = useState(false);
	const removeForm = useForm<{ poemId?: number; reason: string }>({
		defaultValues: { poemId: undefined, reason: '' },
		mode: 'onChange',
	});
	const selectedPoemId = removeForm.watch('poemId');
	const removeReason = removeForm.watch('reason');

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setDebouncedPoemSearch(poemSearchTitle.trim());
		}, SEARCH_DELAY_MS);
		return () => window.clearTimeout(timeout);
	}, [poemSearchTitle]);

	const shouldSearchPoems = debouncedPoemSearch.length >= MIN_SEARCH_LENGTH;
	const poemsQuery = useQuery({
		...poems.getPoems.query({
			limit: 12,
			searchTitle: shouldSearchPoems ? debouncedPoemSearch : undefined,
			orderBy: 'createdAt',
			orderDirection: 'desc',
		}),
		enabled: shouldSearchPoems,
	});

	const { contains } = useFilter({
		sensitivity: 'base',
		ignorePunctuation: false,
		usage: 'search',
	});

	const {
		collection: poemCollection,
		filter: poemFilter,
		set: setPoems,
	} = useListCollection({
		initialItems: [],
		itemToValue: (item: {
			id: number;
			title: string;
			author: { name: string; nickname: string };
		}) => String(item.id),
		itemToString: (item: { title: string; author: { name: string; nickname: string } }) =>
			`${item.title} ${item.author.name} ${item.author.nickname}`,
		filter: contains,
		limit: 12,
	});

	useEffect(() => {
		const poemsList = (poemsQuery.data?.poems ?? []).filter((poem) => poem.status !== 'draft');
		setPoems(
			poemsList.map((poem) => ({
				id: poem.id,
				title: poem.title,
				author: {
					name: poem.author.name,
					nickname: poem.author.nickname,
				},
			})),
		);
	}, [poemsQuery.data, setPoems]);

	const isRemoveReasonValid = removeReason.trim().length >= 10;
	const canRemovePoem =
		Number.isInteger(selectedPoemId) &&
		(selectedPoemId ?? 0) > 0 &&
		isRemoveReasonValid &&
		!isRemovingPoem;

	async function handleRemovePoem() {
		if (!canRemovePoem || !selectedPoemId) return;
		setIsRemovingPoem(true);
		try {
			await moderation.moderatePoem.mutate({
				poemId: String(selectedPoemId),
				moderationStatus: 'removed',
				reason: removeReason.trim(),
			});
			toaster.create({
				type: 'success',
				title: 'Poem removed',
				closable: true,
			});
			removeForm.reset({ poemId: undefined, reason: '' });
			setPoemInputValue('');
			setPoemSearchTitle('');
			setDebouncedPoemSearch('');
		} catch (error) {
			toaster.create({
				type: 'error',
				title: 'Could not remove poem',
				description: error instanceof Error ? error.message : 'Try again later.',
				closable: true,
			});
		} finally {
			setIsRemovingPoem(false);
		}
	}

	return (
		<VStack as='form' align='stretch' gap={4} w='full' maxW='lg' pt={2}>
			<Field.Root required>
				<Field.Label textStyle='small' fontWeight='medium'>
					Poem
				</Field.Label>
				<Controller
					name='poemId'
					control={removeForm.control}
					render={({ field }) => (
						<Combobox.Root
							collection={poemCollection}
							value={field.value ? [String(field.value)] : []}
							inputValue={poemInputValue}
							onInputValueChange={(details) => {
								setPoemInputValue(details.inputValue);
								setPoemSearchTitle(details.inputValue);
								poemFilter(details.inputValue);
							}}
							onValueChange={(details) => {
								const newId = details.value[0] ? Number(details.value[0]) : undefined;
								field.onChange(newId);
								if (!newId) {
									setPoemInputValue('');
									return;
								}
								const selected = poemCollection.items.find((item) => item.id === newId);
								setPoemInputValue(
									selected ? `${selected.title} - @${selected.author.nickname}` : '',
								);
							}}
							w='full'
						>
							<Combobox.Control
								bg='rgba(255, 255, 255, 0.03)'
								border='1px solid'
								borderColor='border'
								borderRadius='md'
								transition='all 0.22s ease'
								_hover={{
									borderColor: 'borderHover',
									bg: 'rgba(255, 255, 255, 0.05)',
								}}
								_focusWithin={{
									borderColor: 'pink.300',
									boxShadow: '0 0 0 5px rgba(255, 143, 189, 0.25)',
									bg: 'rgba(255, 255, 255, 0.06)',
								}}
							>
								<Combobox.Input
									placeholder='Type at least 2 characters'
									textStyle='small'
									color='text'
									_placeholder={{ color: 'pink.200' }}
								/>
								<Combobox.IndicatorGroup>
									<Combobox.ClearTrigger color='pink.200' />
									<Combobox.Trigger color='pink.200' />
								</Combobox.IndicatorGroup>
							</Combobox.Control>

							<Portal>
								<Combobox.Positioner>
									<Combobox.Content
										bg='rgba(27, 0, 25, 0.98)'
										border='1px solid'
										borderColor='purple.700'
										borderRadius='md'
										backdropFilter='blur(6px)'
										overflow='hidden'
									>
										<Combobox.Empty>
											{poemsQuery.isLoading
												? 'Loading poems...'
												: shouldSearchPoems
													? 'No poems found.'
													: 'Type to search poems.'}
										</Combobox.Empty>
										{poemCollection.items.map((item) => (
											<Combobox.Item
												key={item.id}
												item={item}
												color='pink.100'
												_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
												_highlighted={{ bg: 'rgba(255, 143, 189, 0.14)' }}
											>
												<Flex direction='column' gap={1}>
													<Text textStyle='small'>{item.title}</Text>
													<Text textStyle='smaller' color='pink.200'>
														{item.author.name} - @{item.author.nickname}
													</Text>
												</Flex>
												<Combobox.ItemIndicator color='pink.200' />
											</Combobox.Item>
										))}
									</Combobox.Content>
								</Combobox.Positioner>
							</Portal>
						</Combobox.Root>
					)}
				/>
			</Field.Root>

			<Field.Root required>
				<Field.Label textStyle='small' fontWeight='medium'>
					Reason
				</Field.Label>
				<Textarea
					value={removeReason}
					onChange={(event) => removeForm.setValue('reason', event.target.value)}
					placeholder='Explain why (min 10 characters)'
					textStyle='small'
					bg='rgba(255, 255, 255, 0.03)'
					borderColor='border'
					_hover={{ borderColor: 'borderHover' }}
					_focusVisible={{
						borderColor: 'pink.300',
						boxShadow: '0 0 0 5px rgba(255, 143, 189, 0.25)',
					}}
					minH='96px'
				/>
				<Box minH='18px' mt={1}>
					{removeReason.trim().length > 0 && !isRemoveReasonValid && (
						<Text textStyle='smaller' color='red.400'>
							Reason must be at least 10 characters.
						</Text>
					)}
				</Box>
			</Field.Root>

			<Flex justify='flex-end'>
				<Button
					variant='solidPink'
					colorPalette='gray'
					size='sm'
					onClick={handleRemovePoem}
					disabled={!canRemovePoem}
					loading={isRemovingPoem}
				>
					Remove poem
				</Button>
			</Flex>
		</VStack>
	);
}
