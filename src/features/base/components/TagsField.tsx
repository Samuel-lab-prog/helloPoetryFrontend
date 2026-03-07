import { TagsInput, Field } from '@chakra-ui/react';
import {
	Controller,
	type Control,
	type FieldErrors,
	type FieldValues,
	type Path,
} from 'react-hook-form';

interface TagsFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	error?: FieldErrors<T>;
	required?: boolean;
	disabled?: boolean;
	transformValue?: (value: string[]) => unknown;
}

export function TagsField<T extends FieldValues>({
	control,
	name,
	label,
	error,
	required,
	disabled,
	transformValue,
	placeholder,
}: TagsFieldProps<T>) {
	return (
		<Field.Root
			required={required}
			invalid={!!error}
			w='full'
			color='gray.700'
		>
			<Field.Label color='gray.700'>
				{label}
				{required && <Field.RequiredIndicator />}
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<TagsInput.Root
						variant='outline'
						value={field.value ?? []}
						disabled={disabled}
						onValueChange={(details) => {
							const value = transformValue
								? transformValue(details.value)
								: details.value;
							field.onChange(value);
						}}
					>
						<TagsInput.Control
							bg='transparent'
							color='gray.700'
						>
							<TagsInput.Items>
								{field.value?.map((tag: string, index: number) => (
									<TagsInput.Item
										key={index}
										index={index}
										value={tag}
										bg='white'
										color='gray.700'
									>
										<TagsInput.ItemPreview
											bg='white'
											color='gray.700'
											_highlighted={{
												filter: 'brightness(0.9)',
												color: 'gray.700',
											}}
										>
											<TagsInput.ItemText
												color='white'
												bg='white'
											>
												{tag}
											</TagsInput.ItemText>
											<TagsInput.ItemDeleteTrigger />
										</TagsInput.ItemPreview>
										<TagsInput.ItemInput color='gray.700' />
									</TagsInput.Item>
								))}
							</TagsInput.Items>

							<TagsInput.Input
								placeholder={placeholder ?? 'Adicione uma tag'}
								bg='transparent'
								color='gray.700'
							/>
							<TagsInput.ClearTrigger color='gray.700' />
						</TagsInput.Control>
					</TagsInput.Root>
				)}
			/>

			<Field.ErrorText color='gray.700'>
				{error?.message?.toString()}
			</Field.ErrorText>
		</Field.Root>
	);
}
