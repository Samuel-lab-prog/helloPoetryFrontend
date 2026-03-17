import type { Control, FieldValues, Path } from 'react-hook-form';

export type TagsFieldProps<T extends FieldValues> = {
	control: Control<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	error?: unknown;
	required?: boolean;
	disabled?: boolean;
	maxTags?: number;
	maxTagLength?: number;
	transformValue?: (value: string[]) => unknown;
};
