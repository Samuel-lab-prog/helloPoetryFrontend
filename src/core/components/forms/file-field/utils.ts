export function buildFileValidationRules(validateFile?: (file: File | null) => string | null) {
	if (!validateFile) return undefined;

	return {
		validate: (value: File | null | undefined) => {
			const message = validateFile(value ?? null);
			return message ?? true;
		},
	};
}
