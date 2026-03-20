/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, type ButtonProps } from '@chakra-ui/react';
import type { ComponentProps, ReactNode } from 'react';
import { FieldContainer } from './FieldContainer';
import { FormCard } from './FormCard';
import { FormField } from './FormField';
import { FormButton } from './FormButton';
import { FileField } from './FileField';
import { SelectField } from './SelectField';
import { TagsField } from '../TagsField';
import { AudioField } from './AudioField';

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
	rows?: number;
	minLength?: number;
	maxLength?: number;
	showCharacterCount?: boolean;
	disabled?: boolean;

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

type SelectFieldOption = {
	value: string;
	label: string;
};

type SelectInputField<T extends FieldValues> = BaseField & {
	kind: 'select';
	name: Path<T>;
	label: string;
	options: SelectFieldOption[];
	required?: boolean;
	placeholder?: string;
	disabled?: boolean;
	transformValue?: (value: string) => unknown;
};

type TagsInputField<T extends FieldValues> = BaseField & {
	kind: 'tags';
	name: Path<T>;
	label: string;
	required?: boolean;
	disabled?: boolean;
	maxTags?: number;
	maxTagLength?: number;
	placeholder?: string;
	transformValue?: (value: string[]) => unknown;
};

type AudioInputField<T extends FieldValues> = BaseField & {
	kind: 'audio';
	name: Path<T>;
	label: string;
	required?: boolean;
	accept?: string;
	disabled?: boolean;
	labels?: {
		record?: string;
		stop?: string;
		discard?: string;
		upload?: string;
		clear?: string;
		previewRecorded?: string;
		previewUploaded?: string;
	};
};

type DedicationInputField<T extends FieldValues> = BaseField & {
	kind: 'dedication';
	name: Path<T>;
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

export type Field<T extends FieldValues> =
	| InputField<T>
	| FileUploadField<T>
	| SelectInputField<T>
	| TagsInputField<T>
	| AudioInputField<T>
	| DedicationInputField<T>
	| CustomField<T>;

type FieldRenderers<T extends FieldValues> = {
	dedication?: (
		context: CustomFieldRenderContext<T> & { field: DedicationInputField<T> },
	) => ReactNode;
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
	cardProps?: ComponentProps<typeof FormCard>;
	renderers?: FieldRenderers<T>;
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
	renderers,
}: DynamicFormProps<T>) {
	const renderField = (field: Field<T>, index: number) => {
		const delay = field.delay ?? 40 + index * 80;
		const hasError = field.kind === 'custom' ? field.hasError : !!errors[field.name];
		const key = field.kind === 'custom' ? field.id : String(field.name);

		// eslint-disable-next-line no-useless-assignment
		let content: ReactNode = null;

		switch (field.kind) {
			case 'custom':
				content = field.render({ control, errors, setError, clearErrors, isValid, loading });
				break;
			case 'file':
				content = (
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
				);
				break;
			case 'select':
				content = (
					<SelectField
						control={control}
						name={field.name}
						label={field.label}
						options={field.options}
						error={errors[field.name]}
						required={field.required}
						placeholder={field.placeholder}
						disabled={field.disabled}
						transformValue={field.transformValue}
					/>
				);
				break;
			case 'tags':
				content = (
					<TagsField
						control={control}
						name={field.name}
						label={field.label}
						error={errors[field.name]}
						required={field.required}
						disabled={field.disabled}
						maxTags={field.maxTags}
						maxTagLength={field.maxTagLength}
						placeholder={field.placeholder}
						transformValue={field.transformValue}
					/>
				);
				break;
			case 'audio':
				content = (
					<AudioField
						control={control}
						name={field.name}
						label={field.label}
						required={field.required}
						error={errors[field.name]}
						accept={field.accept}
						disabled={field.disabled}
						labels={field.labels}
					/>
				);
				break;
			case 'dedication':
				if (!renderers?.dedication) return null;
				content = renderers.dedication({
					control,
					errors,
					setError,
					clearErrors,
					isValid,
					loading,
					field,
				});
				break;
			default:
				content = (
					<FormField
						{...field}
						control={control}
						error={errors[field.name]}
						setError={setError}
						clearErrors={clearErrors}
						type={field.type || 'text'}
						as={field.type === 'textarea' ? 'textarea' : 'input'}
						rows={field.rows ?? 5}
						disabled={field.disabled}
					/>
				);
		}

		return (
			<FieldContainer key={key} delay={delay} hasError={hasError}>
				{content}
			</FieldContainer>
		);
	};

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

			{fields.map(renderField)}

			{extraContent}

			<FormButton isValid={isValid} loading={loading} variant={buttonVariant}>
				{buttonLabel}
			</FormButton>
		</FormCard>
	);
}
