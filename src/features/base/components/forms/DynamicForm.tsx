import { Text, type ButtonProps } from '@chakra-ui/react';
import { FieldContainer } from './FieldContainer';
import { FormCard } from './FormCard';
import { FormField } from './FormField';
import { FormButton } from './FormButton';
import type {
	FieldValues,
	Control,
	SubmitHandler,
	Path,
} from 'react-hook-form';

type FieldType = 'text' | 'password' | 'textarea';

export type Field<T> = {
	name: Path<T>;
	label: string;
	required?: boolean;
	autoFocus?: boolean;
	type?: FieldType;
};

interface DynamicFormProps<T extends FieldValues> {
	fields: Field<T>[];
	control: Control<T>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: any;
	isValid: boolean;
	loading: boolean;
	generalError?: string;
	onSubmit: SubmitHandler<T>;
	buttonLabel: string;
	buttonVariant?: ButtonProps['variant'];
	handleSubmitFn: (
		fn: SubmitHandler<T>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
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
	handleSubmitFn,
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
						type={field.type || 'text'}
						as={field.type === 'textarea' ? 'textarea' : 'input'}
						rows={5}
					/>
				</FieldContainer>
			))}

			<FormButton isValid={isValid} loading={loading} variant={buttonVariant}>
				{buttonLabel}
			</FormButton>
		</FormCard>
	);
}
