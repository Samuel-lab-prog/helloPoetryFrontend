import { Box, Field, TagsInput } from '@chakra-ui/react';
import { useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

interface TagsFieldProps<T extends FieldValues> {
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
}

export function TagsField<T extends FieldValues>({
	control,
	name,
	label,
	error,
	required,
	disabled,
	maxTags = 10,
	maxTagLength,
	transformValue,
	placeholder,
}: TagsFieldProps<T>) {
	const [isFocused, setIsFocused] = useState(false);
	const errorMessage = resolveErrorMessage(error);
	const hasError = Boolean(errorMessage);

	function sanitizeTags(rawTags: string[]) {
		const seen = new Set<string>();
		const normalized: string[] = [];

		for (const rawTag of rawTags) {
			const trimmed = rawTag.trim();
			if (!trimmed) continue;
			const normalizedTag = maxTagLength ? trimmed.slice(0, maxTagLength) : trimmed;
			if (!normalizedTag) continue;

			const dedupeKey = normalizedTag.toLocaleLowerCase();
			if (seen.has(dedupeKey)) continue;

			seen.add(dedupeKey);
			normalized.push(normalizedTag);

			if (normalized.length >= maxTags) break;
		}

		return normalized;
	}

	return (
		<Field.Root required={required} invalid={!!error} w='full'>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={hasError ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				{label}
				{required && <Field.RequiredIndicator />}
			</Field.Label>

			<Controller
				name={name}
				control={control}
				render={({ field }) => {
					const selectedTags: string[] = Array.isArray(field.value)
						? field.value.filter((tag: unknown): tag is string => typeof tag === 'string')
						: [];
					const tagsCount = selectedTags.length;
					const limitReached = tagsCount >= maxTags;

					return (
						<>
							<TagsInput.Root
								w='full'
								colorPalette='pink'
								animationName='fade-in'
								animationDuration='260ms'
								animationTimingFunction='ease-out'
								value={selectedTags}
								disabled={disabled}
								css={{
									"& [data-scope='tags-input'][data-part='item']": {
										background: 'rgba(122, 19, 66, 0.7) !important',
										color: 'var(--chakra-colors-pink-50) !important',
										borderColor: 'var(--chakra-colors-pink-400) !important',
									},
									"& [data-scope='tags-input'][data-part='itemPreview']": {
										background: 'transparent !important',
										color: 'var(--chakra-colors-pink-50) !important',
									},
								}}
								onValueChange={(details) => {
									const sanitizedTags = sanitizeTags(details.value);
									const value = transformValue ? transformValue(sanitizedTags) : sanitizedTags;
									field.onChange(value);
								}}
							>
								<TagsInput.Control
									bg='rgba(255, 255, 255, 0.03)'
									color='text'
									border='1px solid'
									borderColor={hasError ? 'error' : isFocused ? 'pink.300' : 'border'}
									borderRadius='md'
									px={2}
									py={2}
									minH='42px'
									transition='all 0.22s ease'
									_hover={{
										borderColor: hasError ? 'error' : 'borderHover',
										bg: 'rgba(255, 255, 255, 0.03)',
									}}
									_focusWithin={{
										borderColor: hasError ? 'error' : 'pink.300',
										boxShadow: hasError
											? '0 0 0 5px rgba(239, 68, 68, 0.25)'
											: '0 0 0 5px rgba(255, 143, 189, 0.25)',
										bg: 'rgba(255, 255, 255, 0.04)',
									}}
								>
									<TagsInput.Items>
										{selectedTags.map((tag: string, index: number) => (
											<TagsInput.Item
												key={index}
												index={index}
												value={tag}
												bg='rgba(122, 19, 66, 0.7)'
												color='pink.50'
												border='1px solid'
												borderColor='pink.400'
												borderRadius='full'
												animationName='fade-in'
												animationDuration='180ms'
												_highlighted={{
													bg: 'rgba(154, 26, 83, 0.82)',
													color: 'pink.50',
												}}
												_selected={{
													bg: 'rgba(154, 26, 83, 0.82)',
													color: 'pink.50',
												}}
											>
												<TagsInput.ItemPreview
													bg='transparent'
													color='pink.50'
													_highlighted={{
														color: 'pink.50',
													}}
												>
													<TagsInput.ItemText color='pink.50'>{tag}</TagsInput.ItemText>
													<TagsInput.ItemDeleteTrigger
														color='pink.200'
														_hover={{ color: 'pink.50' }}
													/>
												</TagsInput.ItemPreview>
												<TagsInput.ItemInput bg='transparent' color='pink.50' />
											</TagsInput.Item>
										))}
									</TagsInput.Items>

									<TagsInput.Input
										placeholder={
											limitReached ? 'Limite de tags atingido' : (placeholder ?? 'Adicione uma tag')
										}
										bg='transparent'
										color='text'
										disabled={disabled || limitReached}
										maxLength={maxTagLength}
										_placeholder={{ color: 'pink.200' }}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
									/>
									<TagsInput.ClearTrigger
										color='pink.200'
										transition='color 0.2s ease'
										_hover={{ color: 'pink.50' }}
									/>
								</TagsInput.Control>
							</TagsInput.Root>

							<Field.HelperText color='pink.200' mt={1}>
								{tagsCount}/{maxTags} tags
							</Field.HelperText>
						</>
					);
				}}
			/>

			<Box
				display='grid'
				gridTemplateRows={hasError ? '1fr' : '0fr'}
				transition='grid-template-rows 0.24s ease'
			>
				<Field.ErrorText
					color='error'
					opacity={hasError ? 1 : 0}
					transform={hasError ? 'translateY(0)' : 'translateY(-3px)'}
					overflow='hidden'
					minH={0}
					mt={hasError ? 1 : 0}
					transition='opacity 0.2s ease, transform 0.2s ease, margin-top 0.2s ease'
				>
					{errorMessage}
				</Field.ErrorText>
			</Box>
		</Field.Root>
	);
}

function resolveErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;

	if (typeof error === 'string') return error;

	if (typeof error === 'object') {
		const candidate = (error as { message?: unknown }).message;
		if (typeof candidate === 'string') return candidate;
	}

	if (Array.isArray(error)) {
		for (const item of error) {
			const nested = resolveErrorMessage(item);
			if (nested) return nested;
		}
		return undefined;
	}

	if (typeof error === 'object') {
		for (const value of Object.values(error as Record<string, unknown>)) {
			const nested = resolveErrorMessage(value);
			if (nested) return nested;
		}
	}

	return undefined;
}
