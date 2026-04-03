import type {
	Control,
	FieldError,
	FieldValues,
	Path,
	UseFormClearErrors,
	UseFormSetError,
} from 'react-hook-form';

export interface FormFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	required?: boolean;
	autoFocus?: boolean;
	error?: FieldError;
	as?: 'input' | 'textarea';
	rows?: number;
	minLength?: number;
	maxLength?: number;
	showCharacterCount?: boolean;
	disabled?: boolean;
	type?: string;
	transformValue?: (value: string) => unknown;
	asyncValidator?: (value: string) => Promise<string | null>;
	debounce?: number;
	setError?: UseFormSetError<T>;
	clearErrors?: UseFormClearErrors<T>;
}
