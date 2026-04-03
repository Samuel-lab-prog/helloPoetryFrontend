import { useCallback } from 'react';
import type { FieldValues, Path, UseFormClearErrors, UseFormSetError } from 'react-hook-form';

type AsyncValidationConfig<T extends FieldValues> = {
	name: Path<T>;
	asyncValidator?: (value: string) => Promise<string | null>;
	debounce?: number;
	setError?: UseFormSetError<T>;
	clearErrors?: UseFormClearErrors<T>;
	debounceRef: React.MutableRefObject<number | null>;
	validationRunRef: React.MutableRefObject<number>;
	hasOwnValidationErrorRef: React.MutableRefObject<boolean>;
};

/**
 * Encapsulates debounced async validation for form fields.
 */
export function useAsyncValidation<T extends FieldValues>({
	name,
	asyncValidator,
	debounce,
	setError,
	clearErrors,
	debounceRef,
	validationRunRef,
	hasOwnValidationErrorRef,
}: AsyncValidationConfig<T>) {
	const clearValidationState = useCallback(() => {
		if (debounceRef.current) {
			window.clearTimeout(debounceRef.current);
		}
	}, [debounceRef]);

	const scheduleValidation = useCallback(
		(rawValue: string) => {
			if (!asyncValidator || !setError || !clearErrors) return;

			const currentRun = ++validationRunRef.current;
			if (debounceRef.current) window.clearTimeout(debounceRef.current);

			debounceRef.current = window.setTimeout(async () => {
				// eslint-disable-next-line no-useless-assignment
				let validationError: string | null = null;
				try {
					validationError = await asyncValidator(rawValue);
				} catch {
					validationError = null;
				}

				if (currentRun !== validationRunRef.current) return;

				if (validationError) {
					hasOwnValidationErrorRef.current = true;
					setError(name, {
						type: 'validate',
						message: validationError,
					});
					return;
				}

				if (hasOwnValidationErrorRef.current) {
					hasOwnValidationErrorRef.current = false;
					clearErrors(name);
				}
			}, debounce ?? 0);
		},
		[
			asyncValidator,
			clearErrors,
			debounce,
			debounceRef,
			hasOwnValidationErrorRef,
			name,
			setError,
			validationRunRef,
		],
	);

	return {
		scheduleValidation,
		clearValidationState,
	};
}
