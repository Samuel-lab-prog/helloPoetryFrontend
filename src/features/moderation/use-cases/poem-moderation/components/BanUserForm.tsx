import { moderation } from '@Api/moderation/endpoints';
import { users } from '@Api/users/endpoints';
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
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

const SEARCH_DELAY_MS = 260;
const MIN_SEARCH_LENGTH = 2;

type AuthClientPreview = { id: number; role: string } | null;

export function BanUserForm({ authClient }: { authClient: AuthClientPreview }) {
	const [searchNickname, setSearchNickname] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const form = useForm<{ userId?: number; reason: string }>({
		defaultValues: { userId: undefined, reason: '' },
		mode: 'onChange',
	});
	const selectedUserId = form.watch('userId');
	const reason = form.watch('reason');

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setDebouncedSearch(searchNickname.trim());
		}, SEARCH_DELAY_MS);
		return () => window.clearTimeout(timeout);
	}, [searchNickname]);

	const shouldSearch = debouncedSearch.length >= MIN_SEARCH_LENGTH;
	const usersQuery = useQuery({
		...users.getUsersPreview.query({
			limit: 12,
			searchNickname: shouldSearch ? debouncedSearch : undefined,
		}),
		enabled: shouldSearch,
	});

	const userOptions = useMemo(() => {
		const list = usersQuery.data?.users ?? [];
		const requesterRole = authClient?.role;
		const requesterId = authClient?.id;
		return list.filter((user) => {
			if (requesterId && user.id === requesterId) return false;
			if (requesterRole !== 'admin' && (user.role === 'moderator' || user.role === 'admin'))
				return false;
			return true;
		});
	}, [authClient?.id, authClient?.role, usersQuery.data]);

	const { contains } = useFilter({
		sensitivity: 'base',
		ignorePunctuation: false,
		usage: 'search',
	});

	const { collection, filter, set } = useListCollection({
		initialItems: [],
		itemToValue: (item: { id: number; nickname: string }) => String(item.id),
		itemToString: (item: { nickname: string }) => `@${item.nickname}`,
		filter: contains,
		limit: 12,
	});

	useEffect(() => {
		set(
			userOptions.map((user) => ({
				id: user.id,
				nickname: user.nickname,
			})),
		);
	}, [set, userOptions]);

	const isReasonValid = reason.trim().length >= 10;
	const canSubmit = Number.isInteger(selectedUserId) && isReasonValid && !isSubmitting;

	async function handleBanUser() {
		if (!canSubmit || !selectedUserId) return;
		setIsSubmitting(true);
		try {
			await moderation.banUser.mutate({
				userId: String(selectedUserId),
				reason: reason.trim(),
			});
			toaster.create({
				type: 'success',
				title: 'User banned',
				closable: true,
			});
			form.reset({ userId: undefined, reason: '' });
			setSearchNickname('');
			setDebouncedSearch('');
		} catch (error) {
			toaster.create({
				type: 'error',
				title: 'Could not ban user',
				description: error instanceof Error ? error.message : 'Try again later.',
				closable: true,
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<VStack as='form' align='stretch' gap={4} w='full' maxW='lg'>
			<Field.Root required>
				<Field.Label textStyle='small' fontWeight='medium'>
					User
				</Field.Label>
				<Controller
					name='userId'
					control={form.control}
					render={({ field }) => (
						<Combobox.Root
							collection={collection}
							value={field.value ? [String(field.value)] : []}
							onInputValueChange={(details) => {
								setSearchNickname(details.inputValue);
								filter(details.inputValue);
							}}
							onValueChange={(details) => {
								const newId = details.value[0] ? Number(details.value[0]) : undefined;
								field.onChange(newId);
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
											{usersQuery.isLoading
												? 'Loading users...'
												: shouldSearch
													? 'No users found.'
													: 'Type to search users.'}
										</Combobox.Empty>
										{collection.items.map((item) => (
											<Combobox.Item
												key={item.id}
												item={item}
												color='pink.100'
												_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
												_highlighted={{ bg: 'rgba(255, 143, 189, 0.14)' }}
											>
												@{item.nickname}
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
					value={reason}
					onChange={(event) => form.setValue('reason', event.target.value)}
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
					{reason.trim().length > 0 && !isReasonValid && (
						<Text textStyle='smaller' color='red.400'>
							Reason must be at least 10 characters.
						</Text>
					)}
				</Box>
			</Field.Root>

			<Flex justify='flex-end'>
				<Button
					variant='solidPink'
					size='sm'
					onClick={handleBanUser}
					disabled={!canSubmit}
					loading={isSubmitting}
				>
					Ban user
				</Button>
			</Flex>
		</VStack>
	);
}
