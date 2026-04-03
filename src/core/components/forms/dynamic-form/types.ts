/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentProps, ReactNode } from 'react';
import type { ButtonProps } from '@chakra-ui/react';
import type {
	Control,
	FieldValues,
	Path,
	SubmitHandler,
	UseFormClearErrors,
	UseFormSetError,
} from 'react-hook-form';
import { FormCard } from '../styles/FormCardSurface';

export type FieldType = 'text' | 'password' | 'textarea';

type BaseField = {
	delay?: number;
};

export type InputField<T extends FieldValues> = BaseField & {
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

export type FileUploadField<T extends FieldValues> = BaseField & {
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

export type SelectFieldOption = {
	value: string;
	label: string;
};

export type SelectInputField<T extends FieldValues> = BaseField & {
	kind: 'select';
	name: Path<T>;
	label: string;
	options: SelectFieldOption[];
	required?: boolean;
	placeholder?: string;
	disabled?: boolean;
	transformValue?: (value: string) => unknown;
};

export type TagsInputField<T extends FieldValues> = BaseField & {
	kind: 'tags';
	name: Path<T>;
	label: string;
	required?: boolean;
	disabled?: boolean;
	maxTags?: number;
	maxTagLength?: number;
	placeholder?: string;
	transformValue?: (value: string[]) => unknown;
	filterForbiddenWords?: boolean;
};

export type AudioInputField<T extends FieldValues> = BaseField & {
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

export type DedicationInputField<T extends FieldValues> = BaseField & {
	kind: 'dedication';
	name: Path<T>;
};

export type CustomFieldRenderContext<T extends FieldValues> = {
	control: Control<T>;
	errors: any;
	setError?: UseFormSetError<T>;
	clearErrors?: UseFormClearErrors<T>;
	isValid: boolean;
	loading: boolean;
};

export type CustomField<T extends FieldValues> = BaseField & {
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

export type FieldRenderers<T extends FieldValues> = {
	dedication?: (
		context: CustomFieldRenderContext<T> & { field: DedicationInputField<T> },
	) => ReactNode;
};

export interface DynamicFormProps<T extends FieldValues> {
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
