/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FieldContainer } from '../styles/FieldContainerSurface';
import { FormField } from '../form-field/Component';
import { FileField } from '../file-field/Component';
import { SelectField } from '../select-field/Component';
import { TagsField } from '../tags-field/Component';
import { AudioField } from '../audio-field/Component';
import type { Field, FieldRenderers } from './types';

type RenderContext<T extends FieldValues> = {
	field: Field<T>;
	index: number;
	control: any;
	errors: any;
	isValid: boolean;
	loading: boolean;
	setError?: any;
	clearErrors?: any;
	renderers?: FieldRenderers<T>;
};

/**
 * Maps a field descriptor into its corresponding UI component.
 */
export function renderDynamicField<T extends FieldValues>({
	field,
	index,
	control,
	errors,
	isValid,
	loading,
	setError,
	clearErrors,
	renderers,
}: RenderContext<T>): ReactNode {
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
					filterForbiddenWords={field.filterForbiddenWords}
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
}
