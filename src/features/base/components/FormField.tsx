import { Field, Input, Textarea } from '@chakra-ui/react';
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
}: Props<T>) {
	const Component = as === 'textarea' ? Textarea : Input;

	return (
		<Field.Root
			required={required}
			invalid={!!error}
		>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
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

			<Field.ErrorText>{error?.message?.toString()}</Field.ErrorText>
		</Field.Root>
	);
}
