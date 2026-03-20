/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, type ButtonProps } from '@chakra-ui/react';
import type { ComponentProps, ReactNode } from 'react';
import { FieldContainer } from './FieldContainer';
import { FormCard } from './FormCard';
import { FormField } from './FormField';
import { FormButton } from './FormButton';
import { FileField } from './FileField';

import type {
	FieldValues,
	Control,
	SubmitHandler,
	Path,
	UseFormClearErrors,
	UseFormSetError,
} from 'react-hook-form';

type FieldType = 'text' | 'password' | 'textarea';

type BaseField = {
	delay?: number;
};

type InputField<T extends FieldValues> = BaseField & {
	kind?: 'input';
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

type FileUploadField<T extends FieldValues> = BaseField & {
	kind: 'file';
	name: Path<T>;
	label: string;
	required?: boolean;
	accept?: string;
	buttonLabel?: string;
	helpText?: string;
	preview?: 'image' | 'audio' | 'none';
	disabled?: boolean;
	validateFile?: (file: File | null) => string | null;
};

type CustomFieldRenderContext<T extends FieldValues> = {
	control: Control<T>;
	errors: any;
	setError?: UseFormSetError<T>;
	clearErrors?: UseFormClearErrors<T>;
	isValid: boolean;
	loading: boolean;
};

type CustomField<T extends FieldValues> = BaseField & {
	kind: 'custom';
	id: string;
	render: (context: CustomFieldRenderContext<T>) => ReactNode;
	hasError?: boolean;
};

export type Field<T extends FieldValues> = InputField<T> | FileUploadField<T> | CustomField<T>;

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
	cardProps?: ComponentProps<typeof FormCard>;
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
	cardProps,
}: DynamicFormProps<T>) {
	return (
		<FormCard as='form' onSubmit={handleSubmitFn(onSubmit)} {...cardProps}>
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

			{fields.map((field, i) => {
				const delay = field.delay ?? 40 + i * 80;

				if (field.kind === 'custom') {
					return (
						<FieldContainer key={field.id} delay={delay} hasError={field.hasError}>
							{field.render({
								control,
								errors,
								setError,
								clearErrors,
								isValid,
								loading,
							})}
						</FieldContainer>
					);
				}

				if (field.kind === 'file') {
					return (
						<FieldContainer
							key={String(field.name)}
							delay={delay}
							hasError={!!errors[field.name]}
						>
							<FileField
								control={control}
								name={field.name}
								label={field.label}
								required={field.required}
								error={errors[field.name]}
								accept={field.accept}
								buttonLabel={field.buttonLabel}
								helpText={field.helpText}
								preview={field.preview}
								disabled={field.disabled}
								validateFile={field.validateFile}
							/>
						</FieldContainer>
					);
				}

				return (
					<FieldContainer
						key={String(field.name)}
						delay={delay}
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
				);
			})}

			{extraContent}

			<FormButton isValid={isValid} loading={loading} variant={buttonVariant}>
				{buttonLabel}
			</FormButton>
		</FormCard>
	);
}
