import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { type FieldError, useForm, useWatch } from 'react-hook-form';

import type { PoemMinimalDataType } from '../../types';
import { PoemCombobox } from '../PoemCombobox';

type TestFormValues = {
	poemId?: number;
};

type HarnessProps = {
	poems?: PoemMinimalDataType[];
	defaultPoemId?: number;
	error?: FieldError;
};

// eslint-disable-next-line react-refresh/only-export-components
function PoemComboboxHarness({ poems, defaultPoemId, error }: HarnessProps) {
	const form = useForm<TestFormValues>({
		defaultValues: {
			poemId: defaultPoemId,
		},
	});
	const selectedPoemId = useWatch({
		control: form.control,
		name: 'poemId',
	});

	return (
		<>
			<PoemCombobox name='poemId' control={form.control} poems={poems} error={error} />
			<p>Selected poem: {selectedPoemId ?? 'none'}</p>
		</>
	);
}

export function makePoemComboboxScenario() {
	const props: HarnessProps = {};
	const scenario = {
		withPoems(poems: PoemMinimalDataType[]) {
			props.poems = poems;
			return scenario;
		},
		withLoadingPoems() {
			props.poems = undefined;
			return scenario;
		},
		withDefaultPoemId(poemId: number) {
			props.defaultPoemId = poemId;
			return scenario;
		},
		withError(message: string) {
			props.error = { type: 'manual', message };
			return scenario;
		},
		render() {
			return renderWithProviders(<PoemComboboxHarness {...props} />);
		},
	};

	return scenario;
}
