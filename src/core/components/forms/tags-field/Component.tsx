import { Box, Field } from '@chakra-ui/react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';

import { TagsInputControl } from './TagsInputControl';
import { resolveErrorMessage, sanitizeTags } from './utils';

type TagsFieldProps<T extends FieldValues> = {
	control: Control<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	error?: unknown;
	required?: boolean;
	disabled?: boolean;
	maxTags?: number;
	maxTagLength?: number;
	filterForbiddenWords?: boolean;
	transformValue?: (value: string[]) => unknown;
};

/**
 * Form-friendly tags field with validation, limits, and deduplication.
 * Integrates with react-hook-form via `Controller`.
 */
export function TagsField<T extends FieldValues>({
	control,
	name,
	label,
	error,
	required,
	disabled,
	maxTags = 10,
	maxTagLength,
	filterForbiddenWords = false,
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
								const sanitizedTags = sanitizeTags(value, {
									maxTags,
									maxTagLength,
									filterForbiddenWords,
								});
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
