import { Avatar, Box, Button, Field, Flex, Input, Text, VisuallyHidden } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Controller,
	useWatch,
	type Control,
	type FieldError,
	type FieldValues,
	type Path,
} from 'react-hook-form';

type PreviewType = 'image' | 'audio' | 'none';

interface FileFieldProps<T extends FieldValues> {
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

export function FileField<T extends FieldValues>({
	control,
	name,
	label,
	required,
	error,
	accept,
	buttonLabel = 'Escolher arquivo',
	helpText,
	preview = 'none',
	disabled,
	validateFile,
}: FileFieldProps<T>) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const watchedFile = useWatch({ control, name }) as File | null | undefined;
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!watchedFile) {
			setPreviewUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return null;
			});
			return;
		}

		const nextUrl = URL.createObjectURL(watchedFile);
		setPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return nextUrl;
		});

		return () => {
			URL.revokeObjectURL(nextUrl);
		};
	}, [watchedFile]);

	const rules = useMemo(() => {
		if (!validateFile) return undefined;
		return {
			validate: (value: File | null | undefined) => {
				const message = validateFile(value ?? null);
				return message ?? true;
			},
		};
	}, [validateFile]);

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			render={({ field, fieldState }) => {
				const resolvedError = fieldState.error ?? error;
				const errorMessage = resolvedError?.message?.toString();
				const hasError = Boolean(errorMessage);
				const file = field.value as File | null | undefined;

				return (
					<Field.Root required={required} invalid={hasError}>
						<Field.Label
							textStyle='small'
							fontWeight='medium'
							color={hasError ? 'error' : 'text'}
							transition='color 0.22s ease'
						>
							{label}
							{required && <Field.RequiredIndicator />}
						</Field.Label>

						{preview !== 'none' && previewUrl && (
							<Box mb={3} mt={1}>
								{preview === 'image' && (
									<Avatar.Root size='md'>
										<Avatar.Image src={previewUrl} />
										<Avatar.Fallback name='Avatar' />
									</Avatar.Root>
								)}
								{preview === 'audio' && (
									<audio controls preload='metadata' src={previewUrl} />
								)}
							</Box>
						)}

						<Flex align='center' gap={3} wrap='wrap'>
							<Button
								as='label'
								size='sm'
								variant='outlinePurple'
								cursor='pointer'
								disabled={disabled}
							>
								{buttonLabel}
								<VisuallyHidden>
									<Input
										ref={inputRef}
										type='file'
										accept={accept}
										onChange={(event) => {
											const nextFile = event.target.files?.[0] ?? null;
											field.onChange(nextFile);
										}}
										disabled={disabled}
									/>
								</VisuallyHidden>
							</Button>
							<Text textStyle='smaller' color='pink.200'>
								{file ? file.name : 'Nenhum arquivo selecionado'}
							</Text>
						</Flex>

						{helpText && (
							<Text textStyle='smaller' color='pink.200' mt={2}>
								{helpText}
							</Text>
						)}

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
			}}
		/>
	);
}
