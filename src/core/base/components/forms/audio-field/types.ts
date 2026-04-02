import type { Control, FieldError, FieldValues, Path } from 'react-hook-form';

export type PreviewSource = 'recorded' | 'uploaded' | null;

export type AudioFieldLabels = {
	record?: string;
	stop?: string;
	discard?: string;
	upload?: string;
	clear?: string;
	previewRecorded?: string;
	previewUploaded?: string;
};

export interface AudioFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	required?: boolean;
	error?: FieldError;
	accept?: string;
	disabled?: boolean;
	labels?: AudioFieldLabels;
}
