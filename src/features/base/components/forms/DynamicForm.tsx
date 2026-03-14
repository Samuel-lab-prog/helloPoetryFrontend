/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, type ButtonProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { FieldContainer } from './FieldContainer';
import { FormCard } from './FormCard';
import { FormField } from './FormField';
import { FormButton } from './FormButton';

import type {
	FieldValues,
	Control,
	SubmitHandler,
	Path,
	UseFormClearErrors,
	UseFormSetError,
} from 'react-hook-form';

type FieldType = 'text' | 'password' | 'textarea';

export type Field<T extends FieldValues> = {
	name: Path<T>;
	label: string;
	required?: boolean;
	autoFocus?: boolean;
	type?: FieldType;
	minLength?: number;
	maxLength?: number;
	showCharacterCount?: boolean;

	asyncValidator?: (value: string) => Promise<string | null>;
	debounce?: number;
};

interface DynamicFormProps<T extends FieldValues> {
	fields: Field<T>[];
	control: Control<T>;
	errors: any;
	isValid: boolean;
	loading: boolean;
	generalError?: string;
	onSubmit: SubmitHandler<T>;
	buttonLabel: string;
	buttonVariant?: ButtonProps['variant'];
	setError?: UseFormSetError<T>;
	clearErrors?: UseFormClearErrors<T>;
	handleSubmitFn: (fn: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	extraContent?: ReactNode;
}

export function DynamicForm<T extends FieldValues>({
	fields,
	control,
	errors,
	isValid,
	loading,
	generalError,
	onSubmit,
	buttonLabel,
	buttonVariant,
	setError,
	clearErrors,
	handleSubmitFn,
	extraContent,
}: DynamicFormProps<T>) {
	return (
		<FormCard as='form' onSubmit={handleSubmitFn(onSubmit)}>
			{generalError && (
				<Text
					color='red.500'
					fontSize='sm'
					mb={2}
					animationName='shake-x, fade-in'
					animationDuration='240ms'
				>
					{generalError}
				</Text>
			)}

			{fields.map((field, i) => (
				<FieldContainer
					key={String(field.name)}
					delay={40 + i * 80}
					hasError={!!errors[field.name]}
				>
					<FormField
						{...field}
						control={control}
						error={errors[field.name]}
						setError={setError}
						clearErrors={clearErrors}
						type={field.type || 'text'}
						as={field.type === 'textarea' ? 'textarea' : 'input'}
						rows={5}
					/>
				</FieldContainer>
			))}

			{extraContent}

			<FormButton isValid={isValid} loading={loading} variant={buttonVariant}>
				{buttonLabel}
			</FormButton>
		</FormCard>
	);
}
