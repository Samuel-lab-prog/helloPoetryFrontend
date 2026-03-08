import { Box, Field, Input, Textarea } from '@chakra-ui/react';
import {
	Controller,
	type Control,
	type FieldErrors,
	type FieldValues,
	type Path,
} from 'react-hook-form';

interface Props<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	required?: boolean;
	autoFocus?: boolean;
	error?: FieldErrors<T>;
	as?: 'input' | 'textarea';
	rows?: number;
	disabled?: boolean;
	type?: string;
	transformValue?: (value: string) => unknown;
}

export function FormField<T extends FieldValues>({
	control,
	name,
	label,
	required,
	error,
	as = 'input',
	rows,
	type,
	transformValue,
	disabled,
	autoFocus,
}: Props<T>) {
	const Component = as === 'textarea' ? Textarea : Input;
	const errorMessage = error?.message?.toString();
	const hasError = Boolean(errorMessage);

	return (
		<Field.Root
			required={required}
			invalid={!!error}
		>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={error ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				{label}
				{required && <Field.RequiredIndicator />}
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => (
					<Component
						textStyle='small'
						transition='all 0.22s ease'
						bg='rgba(255, 255, 255, 0.03)'
						borderColor={error ? 'error' : 'border'}
						_hover={{
							borderColor: 'borderHover',
							bg: 'rgba(255, 255, 255, 0.05)',
						}}
						_focusVisible={{
							borderColor: error ? 'error' : 'pink.300',
							boxShadow: error
								? '0 0 0 3px rgba(239, 68, 68, 1)'
								: '0 0 0 3px rgba(255, 143, 189, 1)',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
						_focus={{
							borderColor: error ? 'error' : 'pink.300',
							bg: 'rgba(255, 255, 255, 0.06)',
						}}
						autoFocus={autoFocus}
						rows={as === 'textarea' ? rows : undefined}
						type={type}
						value={field.value ?? ''}
						disabled={disabled}
						onChange={(e) => {
							const value = e.target.value;
							field.onChange(transformValue ? transformValue(value) : value);
						}}
					/>
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
