import { Field, Combobox, Portal, useListCollection, useFilter } from '@chakra-ui/react';
import {
	Controller,
	type Control,
	type Path,
	type FieldErrors,
	type FieldValues,
} from 'react-hook-form';
import { useEffect } from 'react';
import { type PoemMinimalDataType } from '../../types';

interface Props<T extends FieldValues> {
	control: Control<T>;
	poems?: PoemMinimalDataType[];
	error?: FieldErrors<T>;
	name: Path<T>;
}

export function PoemCombobox<T extends FieldValues>({ name, error, control, poems }: Props<T>) {
	const { contains } = useFilter({
		sensitivity: 'base',
		ignorePunctuation: false,
		usage: 'search',
	});

	const { collection, filter, set } = useListCollection<PoemMinimalDataType>({
		initialItems: [],
		itemToValue: (item) => String(item.id),
		itemToString: (item) => item.title,
		filter: contains,
		limit: 10,
	});

	useEffect(() => {
		if (!poems) return;
		set(poems.map((poem) => ({ id: poem.id, title: poem.title })));
	}, [poems, set]);

	return (
		<Field.Root required>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={error ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				Poem <Field.RequiredIndicator />
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Combobox.Root
						collection={collection}
						value={field.value ? [String(field.value)] : []}
						onInputValueChange={(val) => filter(val.inputValue)}
						onValueChange={(val) => {
							const newId = val.value[0] ? Number(val.value[0]) : undefined;

							field.onChange(newId);
						}}
						w='full'
					>
						<Combobox.Control
							bg='rgba(255, 255, 255, 0.03)'
							border='1px solid'
							borderColor={error ? 'error' : 'border'}
							borderRadius='md'
							transition='all 0.22s ease'
							_hover={{
								borderColor: error ? 'error' : 'borderHover',
								bg: 'rgba(255, 255, 255, 0.05)',
							}}
							_focusWithin={{
								borderColor: error ? 'error' : 'pink.300',
								boxShadow: error
									? '0 0 0 5px rgba(239, 68, 68, 0.25)'
									: '0 0 0 5px rgba(255, 143, 189, 0.25)',
								bg: 'rgba(255, 255, 255, 0.06)',
							}}
						>
							<Combobox.Input
								placeholder='Select a poem'
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
									<Combobox.Empty>{poems ? 'No poems found.' : 'Loading poems...'}</Combobox.Empty>
									{collection.items.map((item) => (
										<Combobox.Item
											key={item.id}
											item={item}
											color='pink.100'
											_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
											_highlighted={{ bg: 'rgba(255, 143, 189, 0.14)' }}
										>
											{item.title}
											<Combobox.ItemIndicator color='pink.200' />
										</Combobox.Item>
									))}
								</Combobox.Content>
							</Combobox.Positioner>
						</Portal>
					</Combobox.Root>
				)}
			/>
			<Field.ErrorText
				color='error'
				opacity={error ? 1 : 0}
				transform={error ? 'translateY(0)' : 'translateY(-3px)'}
				transition='opacity 0.2s ease, transform 0.2s ease'
			>
				{error?.message?.toString()}
			</Field.ErrorText>
		</Field.Root>
	);
}
