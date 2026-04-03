import { Text } from '@chakra-ui/react';
import type { FieldValues } from 'react-hook-form';
import { FormCard } from '../styles/FormCardSurface';
import { renderDynamicField } from './renderField';
import type { DynamicFormProps } from './types';
import { FormButton } from '../form-button/Component';

/**
 * Renders a form dynamically based on a list of field descriptors.
 * Keeps layout, validation, and error display consistent across screens.
 */
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

			{fields.map((field, index) =>
				renderDynamicField({
					field,
					index,
					control,
					errors,
					isValid,
					loading,
					setError,
					clearErrors,
					renderers,
				}),
			)}

			{extraContent}

			<FormButton isValid={isValid} loading={loading} variant={buttonVariant}>
				{buttonLabel}
			</FormButton>
		</FormCard>
	);
}
