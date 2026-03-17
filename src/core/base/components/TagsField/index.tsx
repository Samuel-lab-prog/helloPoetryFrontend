import { Box, Field } from '@chakra-ui/react';
import { Controller, type FieldValues } from 'react-hook-form';
import { TagsInputControl } from './TagsInputControl';
import type { TagsFieldProps } from './types';
import { resolveErrorMessage, sanitizeTags } from './utils';

export function TagsField<T extends FieldValues>({
	control,
	name,
	label,
	error,
	required,
	disabled,
	maxTags = 10,
	maxTagLength,
	transformValue,
	placeholder,
}: TagsFieldProps<T>) {
	const errorMessage = resolveErrorMessage(error);
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
				render={({ field }) => {
					const selectedTags: string[] = Array.isArray(field.value)
						? field.value.filter((tag: unknown): tag is string => typeof tag === 'string')
						: [];

					return (
						<TagsInputControl
							selectedTags={selectedTags}
							disabled={disabled}
							hasError={hasError}
							maxTags={maxTags}
							maxTagLength={maxTagLength}
							placeholder={placeholder}
							onValueChange={(value) => {
								const sanitizedTags = sanitizeTags(value, { maxTags, maxTagLength });
								const nextValue = transformValue ? transformValue(sanitizedTags) : sanitizedTags;
								field.onChange(nextValue);
							}}
						/>
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

export type { TagsFieldProps };
