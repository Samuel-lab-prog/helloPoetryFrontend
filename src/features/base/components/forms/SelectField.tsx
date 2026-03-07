import { Box, Field, NativeSelect } from '@chakra-ui/react';
import { useState } from 'react';
import {
	Controller,
	type Control,
	type FieldErrors,
	type FieldValues,
	type Path,
} from 'react-hook-form';

interface Option {
	value: string;
	label: string;
}

interface SelectFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	options: Option[];
	error?: FieldErrors<T>;
	required?: boolean;
	placeholder?: string;
	disabled?: boolean;
	transformValue?: (value: string) => unknown; // ← nova prop
}

export function SelectField<T extends FieldValues>({
	control,
	name,
	label,
	options,
	error,
	required,
	disabled,
	placeholder,
	transformValue,
}: SelectFieldProps<T>) {
	const errorMessage = error?.message?.toString();
	const hasError = Boolean(errorMessage);
	const [isFocused, setIsFocused] = useState(false);

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
				disabled={disabled}
				name={name}
				control={control}
				render={({ field }) => (
					<NativeSelect.Root
						size='md'
						w='full'
						animationName='fade-in'
						animationDuration='260ms'
						animationTimingFunction='ease-out'
					>
						<NativeSelect.Field
							textStyle='small'
							bg='surface'
							border='1px solid'
							borderColor={hasError ? 'error' : 'border'}
							borderRadius='md'
							color='text'
							px={3}
							py={2}
							pe={10}
							transition='all 0.22s ease'
							_hover={{
								borderColor: hasError ? 'error' : 'borderHover',
								bg: 'rgba(255, 255, 255, 0.03)',
							}}
							_focusVisible={{
								borderColor: hasError ? 'error' : 'pink.300',
								boxShadow: hasError
									? '0 0 0 5px rgba(239, 68, 68, 0.25)'
									: '0 0 0 5px rgba(255, 143, 189, 0.25)',
								bg: 'rgba(255, 255, 255, 0.04)',
							}}
							_disabled={{
								opacity: 0.65,
								cursor: 'not-allowed',
							}}
							value={field.value ?? ''}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(transformValue ? transformValue(value) : value);
							}}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
						>
							{placeholder && (
								<option value='' disabled style={{ color: '#8e6f8c' }}>
									{placeholder}
								</option>
							)}

							{options.map((option) => (
								<option
									key={option.value}
									value={option.value}
									style={{
										backgroundColor: '#1B0019',
										color: '#ffd6e7',
									}}
								>
									{option.label}
								</option>
							))}
						</NativeSelect.Field>

						<NativeSelect.Indicator
							color={hasError ? 'red.400' : isFocused ? 'pink.300' : 'pink.200'}
							transition='transform 0.2s ease, color 0.2s ease'
							transform={isFocused ? 'rotate(180deg)' : 'rotate(0deg)'}
						/>
					</NativeSelect.Root>
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
