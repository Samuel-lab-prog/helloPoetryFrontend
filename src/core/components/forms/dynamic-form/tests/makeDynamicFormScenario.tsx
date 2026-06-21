import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { vi } from 'vitest';

import { DynamicForm } from '../Component';
import type { Field } from '../types';

type TestFormValues = {
	title: string;
	summary: string;
};

const defaultFields: Field<TestFormValues>[] = [
	{
		name: 'title',
		label: 'Title',
		required: true,
		maxLength: 40,
		showCharacterCount: true,
	},
	{
		name: 'summary',
		label: 'Summary',
		type: 'textarea',
		rows: 3,
	},
];

type HarnessProps = {
	fields: Field<TestFormValues>[];
	defaultValues: TestFormValues;
	generalError?: string;
	isValid: boolean;
	loading: boolean;
	extraContent?: React.ReactNode;
	onSubmit: (values: TestFormValues) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
function DynamicFormHarness({
	fields,
	defaultValues,
	generalError,
	isValid,
	loading,
	extraContent,
	onSubmit,
}: HarnessProps) {
	const form = useForm<TestFormValues>({
		defaultValues,
		mode: 'onChange',
	});
	const stableFields = useMemo(() => fields, [fields]);

	return (
		<DynamicForm<TestFormValues>
			fields={stableFields}
			control={form.control}
			errors={form.formState.errors}
			isValid={isValid}
			loading={loading}
			generalError={generalError}
			onSubmit={onSubmit}
			buttonLabel='Save poem'
			setError={form.setError}
			clearErrors={form.clearErrors}
			handleSubmitFn={form.handleSubmit}
			extraContent={extraContent}
		/>
	);
}

export function makeDynamicFormScenario() {
	const props: HarnessProps = {
		fields: defaultFields,
		defaultValues: {
			title: '',
			summary: '',
		},
		isValid: true,
		loading: false,
		onSubmit: vi.fn(),
	};

	const scenario = {
		mocks: {
			onSubmit: props.onSubmit,
		},
		withGeneralError(message: string) {
			props.generalError = message;
			return scenario;
		},
		withDefaultValues(values: Partial<TestFormValues>) {
			props.defaultValues = {
				...props.defaultValues,
				...values,
			};
			return scenario;
		},
		asInvalid() {
			props.isValid = false;
			return scenario;
		},
		asLoading() {
			props.loading = true;
			return scenario;
		},
		withExtraContent(content: React.ReactNode) {
			props.extraContent = content;
			return scenario;
		},
		render() {
			return renderWithProviders(<DynamicFormHarness {...props} />);
		},
	};

	return scenario;
}
