import { Box, Field, Input, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { Controller, type FieldValues } from 'react-hook-form';

import { useAsyncValidation } from './hooks';
import type { FormFieldProps } from './types';

/**
 * Form-friendly input/textarea field with optional async validation,
 * length counters, and consistent error display.
 */

export function FormField<T extends FieldValues>({
	control,
	name,
	label,
	required,
	error,
	as = 'input',
	rows,
	minLength,
	maxLength,
	showCharacterCount = false,
	type,
	transformValue,
	asyncValidator,
	debounce,
	setError,
	clearErrors,
	disabled,
	autoFocus,
}: FormFieldProps<T>) {
	const Component = as === 'textarea' ? Textarea : Input;
	const debounceRef = useRef<number | null>(null);
	const validationRunRef = useRef(0);
	const hasOwnValidationErrorRef = useRef(false);

	const { scheduleValidation, clearValidationState } = useAsyncValidation({
		name,
		asyncValidator,
		setError,
		clearErrors,
		debounce,
		debounceRef,
		validationRunRef,
		hasOwnValidationErrorRef,
	});

	// eslint-disable-next-line arrow-body-style
	useEffect(() => {
		return () => {
			clearValidationState();
		};
	}, [clearValidationState]);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => {
				const resolvedError = fieldState.error ?? error;
				const errorMessage = resolvedError?.message?.toString();
				const hasError = Boolean(errorMessage);
				const valueAsString = typeof field.value === 'string' ? field.value : '';
				const currentLength = valueAsString.length;
				const isBelowMinLength = typeof minLength === 'number' && currentLength < minLength;
				const shouldShowCharacterCount = showCharacterCount && typeof maxLength === 'number';

				return (
					<Field.Root required={required} invalid={hasError}>
						<Field.Label
							textStyle='small'
							fontWeight='medium'
							color={hasError ? 'error' : 'text'}
							transition='color 0.22s ease'
						>
							{label}
							{required && <Field.RequiredIndicator />}
						</Field.Label>

						<Component
							{...field}
							textStyle='small'
							transition='all 0.22s ease'
							bg='rgba(255, 255, 255, 0.03)'
							borderColor={hasError ? 'error' : 'border'}
							_hover={{
								borderColor: 'borderHover',
								bg: 'rgba(255, 255, 255, 0.05)',
							}}
							_focusVisible={{
								borderColor: hasError ? 'error' : 'pink.300',
								boxShadow: hasError
									? '0 0 0 3px rgba(239, 68, 68, 1)'
									: '0 0 0 3px rgba(255, 143, 189, 1)',
								bg: 'rgba(255, 255, 255, 0.06)',
							}}
							_focus={{
								borderColor: hasError ? 'error' : 'pink.300',
								bg: 'rgba(255, 255, 255, 0.06)',
							}}
							autoFocus={autoFocus}
							rows={as === 'textarea' ? rows : undefined}
							minLength={minLength}
							maxLength={maxLength}
							type={type}
							value={field.value ?? ''}
							disabled={disabled}
							onChange={(e) => {
								const rawValue = e.target.value;
								const nextValue = transformValue ? transformValue(rawValue) : rawValue;

								field.onChange(nextValue);

								scheduleValidation(rawValue);
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

						{shouldShowCharacterCount && (
							<Text
								textStyle='small'
								color={isBelowMinLength ? 'error' : 'pink.300'}
								w='full'
								textAlign='right'
								mt={1}
							>
								{currentLength}/{maxLength} characters
							</Text>
						)}
					</Field.Root>
				);
			}}
		/>
	);
}
