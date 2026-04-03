import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';

export type PreviewType = 'image' | 'audio' | 'none';

export interface FileFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	required?: boolean;
	error?: FieldError;
	accept?: string;
	buttonLabel?: string;
	helpText?: string;
	preview?: PreviewType;
	disabled?: boolean;
	validateFile?: (file: File | null) => string | null;
}
