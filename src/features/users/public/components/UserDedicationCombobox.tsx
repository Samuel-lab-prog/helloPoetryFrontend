import {
	Box,
	Button,
	Combobox,
	Field,
	Flex,
	Portal,
	Text,
	useFilter,
	useListCollection,
} from '@chakra-ui/react';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { useEffect, useState } from 'react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

type UserOption = {
	id: number;
	nickname: string;
};

interface UserDedicationComboboxProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	error?: { message?: string };
	users: UserOption[];
	disabled?: boolean;
	isLoading?: boolean;
}

export function UserDedicationCombobox<T extends FieldValues>({
	control,
	name,
	error,
	users,
	disabled,
	isLoading,
}: UserDedicationComboboxProps<T>) {
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const [isOpen, setIsOpen] = useState(false);

	const { contains } = useFilter({
		sensitivity: 'base',
		ignorePunctuation: false,
		usage: 'search',
	});

	const { collection, filter, set } = useListCollection<UserOption>({
		initialItems: [],
		itemToValue: (item) => String(item.id),
		itemToString: (item) => `@${item.nickname}`,
		filter: contains,
		limit: 50,
	});

	useEffect(() => {
		const filteredUsers = authClientId ? users.filter((user) => user.id !== authClientId) : users;
		set(filteredUsers);
	}, [authClientId, set, users]);

	const errorMessage = error?.message?.toString();
	const hasError = Boolean(errorMessage);

	return (
		<Field.Root required={false} invalid={hasError} w='full'>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={hasError ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				Dedicate to (up to 5 users)
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => {
					const selectedIds = Array.isArray(field.value)
						? (field.value as number[]).filter((id) => Number.isFinite(id))
						: [];
					const filteredSelectedIds = authClientId
						? selectedIds.filter((id) => id !== authClientId)
						: selectedIds;
					const selectedUsers = filteredSelectedIds
						.map((id) => users.find((user) => user.id === id))
						.filter((user): user is UserOption => Boolean(user));

					return (
						<>
							<Combobox.Root
								collection={collection}
								multiple
								open={isOpen}
								disabled={disabled}
								value={filteredSelectedIds.map((id) => String(id))}
								onOpenChange={(details) => {
									if (details.open && filteredSelectedIds.length >= 5) {
										setIsOpen(false);
										return;
									}
									setIsOpen(details.open);
								}}
								onInputValueChange={(details) => filter(details.inputValue)}
								onValueChange={(details) => {
									const nextIds = details.value
										.map((id) => Number(id))
										.filter((id) => Number.isInteger(id) && id > 0);
									const filteredIds = authClientId
										? nextIds.filter((id) => id !== authClientId)
										: nextIds;
									const uniqueIds = [...new Set(filteredIds)].slice(0, 5);
									field.onChange(uniqueIds);
									if (uniqueIds.length >= 5) {
										setIsOpen(false);
									}
								}}
								w='full'
							>
								<Combobox.Control
									bg='rgba(255, 255, 255, 0.03)'
									border='1px solid'
									borderColor={hasError ? 'error' : 'border'}
									borderRadius='md'
									transition='all 0.22s ease'
									_hover={{
										borderColor: hasError ? 'error' : 'borderHover',
										bg: 'rgba(255, 255, 255, 0.05)',
									}}
									_focusWithin={{
										borderColor: hasError ? 'error' : 'pink.300',
										boxShadow: hasError
											? '0 0 0 5px rgba(239, 68, 68, 0.25)'
											: '0 0 0 5px rgba(255, 143, 189, 0.25)',
										bg: 'rgba(255, 255, 255, 0.06)',
									}}
								>
									<Combobox.Input
										placeholder={isLoading ? 'Loading users...' : 'Search users to dedicate to'}
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
												{isLoading ? 'Loading users...' : 'No users found.'}
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

							<Flex mt={2} gap={2} wrap='wrap' align='center'>
								<Text textStyle='small' color='pink.200'>
									Selected: {selectedUsers.length}/5
								</Text>
								{selectedUsers.map((user) => (
									<Button
										key={user.id}
										size='xs'
										variant='surface'
										onClick={() =>
											field.onChange(selectedIds.filter((selectedId) => selectedId !== user.id))
										}
									>
										@{user.nickname} ×
									</Button>
								))}
							</Flex>
						</>
					);
				}}
			/>

			<Box
				display='grid'
				gridTemplateRows={hasError ? '1fr' : '0fr'}
				transition='grid-template-rows 0.24s ease'
			>
				<Field.ErrorText
					color='error'
					opacity={hasError ? 1 : 0}
					transform={hasError ? 'translateY(0)' : 'translateY(-3px)'}
					overflow='hidden'
					minH={0}
					mt={hasError ? 1 : 0}
					transition='opacity 0.2s ease, transform 0.2s ease, margin-top 0.2s ease'
				>
					{errorMessage}
				</Field.ErrorText>
			</Box>
		</Field.Root>
	);
}
