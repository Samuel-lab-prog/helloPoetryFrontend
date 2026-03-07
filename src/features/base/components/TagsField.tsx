import { Box, Field, TagsInput } from '@chakra-ui/react';
import { useState } from 'react';
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
	const [isFocused, setIsFocused] = useState(false);
	const errorMessage = error?.message?.toString();
	const hasError = Boolean(errorMessage);

	return (
		<Field.Root required={required} invalid={!!error} w='full'>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={hasError ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				{label}
				{required && <Field.RequiredIndicator />}
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<TagsInput.Root
						w='full'
						animationName='fade-in'
						animationDuration='260ms'
						animationTimingFunction='ease-out'
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
							bg='surface'
							color='text'
							border='1px solid'
							borderColor={
								hasError ? 'error' : isFocused ? 'pink.300' : 'border'
							}
							borderRadius='md'
							px={2}
							py={2}
							minH='42px'
							transition='all 0.22s ease'
							_hover={{
								borderColor: hasError ? 'error' : 'borderHover',
								bg: 'rgba(255, 255, 255, 0.03)',
							}}
							_focusWithin={{
								borderColor: hasError ? 'error' : 'pink.300',
								boxShadow: hasError
									? '0 0 0 5px rgba(239, 68, 68, 0.25)'
									: '0 0 0 5px rgba(255, 143, 189, 0.25)',
								bg: 'rgba(255, 255, 255, 0.04)',
							}}
						>
							<TagsInput.Items>
								{field.value?.map((tag: string, index: number) => (
									<TagsInput.Item
										key={index}
										index={index}
										value={tag}
										bg='purple.700'
										color='pink.100'
										border='1px solid'
										borderColor='purple.500'
										borderRadius='full'
										animationName='fade-in'
										animationDuration='180ms'
									>
										<TagsInput.ItemPreview
											bg='transparent'
											color='pink.100'
											_highlighted={{
												filter: 'brightness(1.08)',
												color: 'pink.50',
											}}
										>
											<TagsInput.ItemText color='pink.100'>
												{tag}
											</TagsInput.ItemText>
											<TagsInput.ItemDeleteTrigger
												color='pink.200'
												_hover={{ color: 'pink.50' }}
											/>
										</TagsInput.ItemPreview>
										<TagsInput.ItemInput color='pink.100' />
									</TagsInput.Item>
								))}
							</TagsInput.Items>

							<TagsInput.Input
								placeholder={placeholder ?? 'Adicione uma tag'}
								bg='transparent'
								color='text'
								_placeholder={{ color: 'pink.200' }}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
							/>
							<TagsInput.ClearTrigger
								color='pink.200'
								transition='color 0.2s ease'
								_hover={{ color: 'pink.50' }}
							/>
						</TagsInput.Control>
					</TagsInput.Root>
				)}
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
