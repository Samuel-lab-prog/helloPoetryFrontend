import { Box, Button, Field, Flex, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	useController,
	type Control,
	type FieldError,
	type FieldValues,
	type Path,
} from 'react-hook-form';

type PreviewSource = 'recorded' | 'uploaded' | null;

type AudioFieldLabels = {
	record?: string;
	stop?: string;
	discard?: string;
	upload?: string;
	clear?: string;
	previewRecorded?: string;
	previewUploaded?: string;
};

interface AudioFieldProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	required?: boolean;
	error?: FieldError;
	accept?: string;
	disabled?: boolean;
	labels?: AudioFieldLabels;
}

export function AudioField<T extends FieldValues>({
	control,
	name,
	label,
	required,
	error,
	accept = 'audio/*',
	disabled,
	labels,
}: AudioFieldProps<T>) {
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioFileInputRef = useRef<HTMLInputElement | null>(null);

	const [isRecording, setIsRecording] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewSource, setPreviewSource] = useState<PreviewSource>(null);
	const [recorderError, setRecorderError] = useState('');

	const { field, fieldState } = useController({ control, name });
	const file = field.value as File | null | undefined;
	const resolvedError = fieldState.error ?? error;
	const errorMessage = resolvedError?.message?.toString();
	const hasError = Boolean(errorMessage);

	const stopMediaStream = useCallback(() => {
		mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		mediaStreamRef.current = null;
	}, []);

	useEffect(
		() => () => {
			stopMediaStream();
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		},
		[previewUrl, stopMediaStream],
	);

	useEffect(() => {
		if (!file) {
			setPreviewSource(null);
			setPreviewUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return null;
			});
			return;
		}

		const nextUrl = URL.createObjectURL(file);
		setPreviewUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return nextUrl;
		});

		return () => {
			URL.revokeObjectURL(nextUrl);
		};
	}, [file]);

	const pickAudioMimeType = useCallback(() => {
		if (typeof MediaRecorder === 'undefined') return '';
		const candidates = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/ogg;codecs=opus',
			'audio/ogg',
			'audio/mpeg',
		];
		return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
	}, []);

	const labelsResolved = useMemo(
		() => ({
			record: labels?.record ?? 'Record',
			stop: labels?.stop ?? 'Stop',
			discard: labels?.discard ?? 'Discard',
			upload: labels?.upload ?? 'Upload file',
			clear: labels?.clear ?? 'Clear file',
			previewRecorded: labels?.previewRecorded ?? 'Recording preview',
			previewUploaded: labels?.previewUploaded ?? 'Uploaded file preview',
		}),
		[labels],
	);

	const handleStartRecording = useCallback(async () => {
		setRecorderError('');

		if (isRecording || disabled) return;
		if (!navigator.mediaDevices?.getUserMedia) {
			setRecorderError('Recording not supported in this browser.');
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaStreamRef.current = stream;

			const mimeType = pickAudioMimeType();
			const recorder = mimeType
				? new MediaRecorder(stream, { mimeType })
				: new MediaRecorder(stream);

			audioChunksRef.current = [];
			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) audioChunksRef.current.push(event.data);
			};
			recorder.onstop = () => {
				const blob = new Blob(audioChunksRef.current, {
					type: recorder.mimeType || mimeType || 'audio/webm',
				});

				const extension = (blob.type || 'audio/webm').split('/')[1] || 'webm';
				const nextFile = new File([blob], `audio-${Date.now()}.${extension}`, {
					type: blob.type || 'audio/webm',
				});

				setPreviewSource('recorded');
				field.onChange(nextFile);
				stopMediaStream();
			};

			recorder.start();
			mediaRecorderRef.current = recorder;
			setIsRecording(true);
		} catch {
			stopMediaStream();
			setRecorderError('Could not access the microphone.');
		}
	}, [disabled, field, isRecording, pickAudioMimeType, stopMediaStream]);

	const handleStopRecording = useCallback(() => {
		if (!isRecording) return;
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	}, [isRecording]);

	const handleDiscardRecording = useCallback(() => {
		if (isRecording) {
			mediaRecorderRef.current?.stop();
			setIsRecording(false);
		}

		setPreviewSource(null);
		field.onChange(null);
	}, [field, isRecording]);

	const handleSelectAudioFile = useCallback(
		(nextFile: File | null) => {
			setPreviewSource(nextFile ? 'uploaded' : null);
			field.onChange(nextFile);
		},
		[field],
	);

	const handleClearSelectedFile = useCallback(() => {
		if (audioFileInputRef.current) {
			audioFileInputRef.current.value = '';
		}
		setPreviewSource(null);
		field.onChange(null);
	}, [field]);

	return (
		<Field.Root required={required} invalid={hasError} w='full'>
			<Field.Label
				textStyle='small'
				fontWeight='medium'
				color={hasError ? 'error' : 'text'}
				transition='color 0.22s ease'
			>
				{label}
				{required && <Field.RequiredIndicator />}
			</Field.Label>

			{previewUrl && (
				<Box mb={3} mt={1}>
					<Text textStyle='smaller' color='pink.200' mb={2}>
						{previewSource === 'recorded'
							? labelsResolved.previewRecorded
							: labelsResolved.previewUploaded}
					</Text>
					<audio controls preload='metadata' src={previewUrl} />
				</Box>
			)}

			<Flex gap={2} wrap='wrap'>
				<Button
					size='sm'
					variant='solidPink'
					onClick={handleStartRecording}
					disabled={isRecording || disabled}
				>
					{labelsResolved.record}
				</Button>
				<Button
					size='sm'
					variant='outlinePurple'
					onClick={handleStopRecording}
					disabled={!isRecording || disabled}
				>
					{labelsResolved.stop}
				</Button>
				<Button
					size='sm'
					variant='ghost'
					onClick={handleDiscardRecording}
					disabled={!file || disabled}
				>
					{labelsResolved.discard}
				</Button>
				<Button
					size='sm'
					variant='surface'
					onClick={() => audioFileInputRef.current?.click()}
					disabled={disabled}
				>
					{labelsResolved.upload}
				</Button>
				<Button
					size='sm'
					variant='ghost'
					onClick={handleClearSelectedFile}
					disabled={!file || disabled}
				>
					{labelsResolved.clear}
				</Button>
			</Flex>
			<input
				ref={audioFileInputRef}
				type='file'
				accept={accept}
				hidden
				onChange={(event) => {
					const nextFile = event.target.files?.[0] ?? null;
					handleSelectAudioFile(nextFile);
				}}
				disabled={disabled}
			/>

			{file && (
				<Text textStyle='smaller' color='pink.200' mt={2}>
					Selected file: {file.name}
				</Text>
			)}

			{recorderError && (
				<Text textStyle='small' color='red.400' mt={2}>
					{recorderError}
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
}
