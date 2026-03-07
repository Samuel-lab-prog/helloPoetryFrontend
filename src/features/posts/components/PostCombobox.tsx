import {
	Field,
	Combobox,
	Portal,
	useListCollection,
	useFilter,
} from '@chakra-ui/react';
import {
	Controller,
	type Control,
	type Path,
	type FieldErrors,
	type FieldValues,
} from 'react-hook-form';
import { useEffect } from 'react';
import { type PostMinimalDataType } from '../types/types';

// This component is meant to be used within react-hook-form forms
// Normally you wanna use this to fetch a full post data after selection
// May turn this into a more generic component in the future
interface Props<T extends FieldValues> {
	control: Control<T>;
	posts?: PostMinimalDataType[];
	error?: FieldErrors<T>;
	name: Path<T>;
}

export function PostCombobox<T extends FieldValues>({
	name,
	error,
	control,
	posts,
}: Props<T>) {
	const { contains } = useFilter({
		sensitivity: 'base',
		ignorePunctuation: false,
		usage: 'search',
	});

	const { collection, filter, set } = useListCollection<PostMinimalDataType>({
		initialItems: [],
		itemToValue: (item) => String(item.id),
		itemToString: (item) => item.title,
		filter: contains,
		limit: 10,
	});

	useEffect(() => {
		if (!posts) return;
		set(posts.map((post) => ({ id: post.id, title: post.title })));
	}, [posts, set]);

	return (
		<Field.Root required>
			<Field.Label>
				Post <Field.RequiredIndicator />
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
						<Combobox.Control>
							<Combobox.Input placeholder='Selecione o post' />
							<Combobox.IndicatorGroup>
								<Combobox.ClearTrigger />
								<Combobox.Trigger />
							</Combobox.IndicatorGroup>
						</Combobox.Control>

						<Portal>
							<Combobox.Positioner>
								<Combobox.Content bg='white'>
									<Combobox.Empty>
										{posts ? 'Nenhum post encontrado.' : 'Carregando posts...'}
									</Combobox.Empty>
									{collection.items.map((item) => (
										<Combobox.Item
											key={item.id}
											item={item}
										>
											{item.title}
											<Combobox.ItemIndicator />
										</Combobox.Item>
									))}
								</Combobox.Content>
							</Combobox.Positioner>
						</Portal>
					</Combobox.Root>
				)}
			/>
			<Field.ErrorText>{error?.message?.toString()}</Field.ErrorText>
		</Field.Root>
	);
}
