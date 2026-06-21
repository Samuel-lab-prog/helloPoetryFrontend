import { Combobox, Field, Portal, useFilter, useListCollection } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import {
	type Control,
	Controller,
	type ControllerRenderProps,
	type FieldError,
	type FieldValues,
	type Path,
} from 'react-hook-form';

import { type PoemMinimalDataType } from '../types';

interface Props<T extends FieldValues> {
	control: Control<T>;
	poems?: PoemMinimalDataType[];
	error?: FieldError;
	name: Path<T>;
}

type ControlledPoemComboboxProps<T extends FieldValues> = {
	field: ControllerRenderProps<T, Path<T>>;
	collection: ReturnType<typeof useListCollection<PoemMinimalDataType>>['collection'];
	filter: ReturnType<typeof useListCollection<PoemMinimalDataType>>['filter'];
	poems?: PoemMinimalDataType[];
	poemsById: Map<number, string>;
	error?: FieldError;
};

function ControlledPoemCombobox<T extends FieldValues>({
	field,
	collection,
	filter,
	poems,
	poemsById,
	error,
}: ControlledPoemComboboxProps<T>) {
	const fieldValue = typeof field.value === 'number' ? field.value : undefined;
	const selectedTitle = fieldValue ? (poemsById.get(fieldValue) ?? '') : '';
	const [inputValue, setInputValue] = useState(selectedTitle);

	useEffect(() => {
		if (!fieldValue) {
			setInputValue('');
			return;
		}
		setInputValue(selectedTitle);
	}, [fieldValue, selectedTitle]);

	return (
		<Combobox.Root
			collection={collection}
			value={fieldValue ? [String(fieldValue)] : []}
			inputValue={inputValue}
			onInputValueChange={(val) => {
				setInputValue(val.inputValue);
				filter(val.inputValue);
			}}
			onValueChange={(val) => {
				const newId = val.value[0] ? Number(val.value[0]) : undefined;

				field.onChange(newId);
				setInputValue(newId ? (poemsById.get(newId) ?? '') : '');
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
	);
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

	const poemsById = useMemo(() => {
		if (!poems) return new Map<number, string>();
		return new Map(poems.map((poem) => [poem.id, poem.title]));
	}, [poems]);

	return (
		<Field.Root required invalid={Boolean(error)}>
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
					<ControlledPoemCombobox
						field={field}
						collection={collection}
						filter={filter}
						poems={poems}
						poemsById={poemsById}
						error={error}
					/>
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
