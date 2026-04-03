import { Box, Button, Field, Flex, HStack, Text } from '@chakra-ui/react';
import { Mic, Square, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type FieldValues, useController } from 'react-hook-form';

import { useAudioPreview } from './hooks';
import type { AudioFieldProps } from './types';
import { pickAudioMimeType, resolveAudioLabels } from './utils';

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
	const [recorderError, setRecorderError] = useState('');

	const { field, fieldState } = useController({ control, name });
	const file = field.value as File | null | undefined;
	const resolvedError = fieldState.error ?? error;
	const errorMessage = resolvedError?.message?.toString();
	const hasError = Boolean(errorMessage);

	const { previewUrl, previewSource, setPreviewSource } = useAudioPreview(file);

	const stopMediaStream = useCallback(() => {
		mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		mediaStreamRef.current = null;
	}, []);

	useEffect(
		() => () => {
			stopMediaStream();
		},
		[stopMediaStream],
	);

	const labelsResolved = resolveAudioLabels(labels);

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
	}, [disabled, field, isRecording, setPreviewSource, stopMediaStream]);

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
	}, [field, isRecording, setPreviewSource]);

	const handleSelectAudioFile = useCallback(
		(nextFile: File | null) => {
			setPreviewSource(nextFile ? 'uploaded' : null);
			field.onChange(nextFile);
		},
		[field, setPreviewSource],
	);

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
					size='xs'
					fontSize='xs'
					variant='solidPink'
					onClick={handleStartRecording}
					disabled={isRecording || disabled}
				>
					<HStack gap={2}>
						<Mic size={14} />
						<Text fontSize='xs'>{labelsResolved.record}</Text>
					</HStack>
				</Button>
				<Button
					size='xs'
					fontSize='xs'
					variant='solidPink'
					colorPalette='gray'
					onClick={handleStopRecording}
					disabled={!isRecording || disabled}
				>
					<HStack gap={2}>
						<Square size={14} />
						<Text fontSize='xs'>{labelsResolved.stop}</Text>
					</HStack>
				</Button>
				<Button
					size='xs'
					fontSize='xs'
					variant='ghost'
					colorPalette='gray'
					onClick={handleDiscardRecording}
					disabled={!file || disabled}
				>
					<HStack gap={2}>
						<Trash2 size={14} />
						<Text fontSize='xs'>{labelsResolved.discard}</Text>
					</HStack>
				</Button>
				<Button
					size='xs'
					fontSize='xs'
					variant='outlinePurple'
					onClick={() => audioFileInputRef.current?.click()}
					disabled={disabled}
				>
					<HStack gap={2}>
						<Upload size={14} />
						<Text fontSize='xs'>{labelsResolved.upload}</Text>
					</HStack>
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
