/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { Text, Heading, Box, Flex, Button } from '@chakra-ui/react';

import { useCreatePoemForm } from '../../hooks/create-poem-form';
import { useUsersPreview, UserDedicationCombobox } from '@features/users';
import {
	FormField,
	SelectField,
	TagsField,
	MarkdownRenderer,
	FieldContainer,
	FormButton,
	FormCard,
	toaster,
} from '@features/base';
import { PoemHeader } from '@features/poems';
import { uploadPoemAudioFile } from '../../utils/poemAudioUpload';
import { api } from '@root/core/api';
import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import {
	POEM_CONTENT_MAX_LENGTH,
	POEM_CONTENT_MIN_LENGTH,
	POEM_EXCERPT_MAX_LENGTH,
	POEM_EXCERPT_MIN_LENGTH,
	POEM_TAG_MAX_LENGTH,
	POEM_TAGS_MAX_AMOUNT,
	POEM_TITLE_MIN_LENGTH,
	POEM_TITLE_MAX_LENGTH,
} from '../../constants/poemConstants';

export function CreatePoemForm() {
	const [isRecording, setIsRecording] = useState(false);
	const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
	const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
	const [audioError, setAudioError] = useState('');
	const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
	const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
	const [isUploadingAudio, setIsUploadingAudio] = useState(false);

	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const audioFileInputRef = useRef<HTMLInputElement | null>(null);

	const stopMediaStream = useCallback(() => {
		mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
		mediaStreamRef.current = null;
	}, []);

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

	const handleStartRecording = useCallback(async () => {
		setAudioError('');

		if (isRecording) return;
		setRecordedBlob(null);
		setRecordedUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return null;
		});
		if (!navigator.mediaDevices?.getUserMedia) {
			setAudioError('Gravacao de audio nao suportada neste navegador.');
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
				setRecordedBlob(blob);
				setRecordedUrl((prev) => {
					if (prev) URL.revokeObjectURL(prev);
					return URL.createObjectURL(blob);
				});
				stopMediaStream();
			};

			recorder.start();
			mediaRecorderRef.current = recorder;
			setIsRecording(true);
		} catch {
			stopMediaStream();
			setAudioError('Nao foi possivel acessar o microfone.');
		}
	}, [isRecording, pickAudioMimeType, stopMediaStream]);

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

		setRecordedBlob(null);
		setRecordedUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return null;
		});
	}, [isRecording]);

	const handleSelectAudioFile = useCallback((file: File | null) => {
		setSelectedAudioFile(file);
		if (file) {
			setRecordedBlob(null);
			setRecordedUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return null;
			});
			setSelectedAudioUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return URL.createObjectURL(file);
			});
		} else {
			setSelectedAudioUrl((prev) => {
				if (prev) URL.revokeObjectURL(prev);
				return null;
			});
		}
	}, []);

	const handleAudioFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0] ?? null;
			handleSelectAudioFile(file);
		},
		[handleSelectAudioFile],
	);

	const handleClearSelectedFile = useCallback(() => {
		if (audioFileInputRef.current) {
			audioFileInputRef.current.value = '';
		}
		handleSelectAudioFile(null);
	}, [handleSelectAudioFile]);

	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending,
		generalError,
		control,
		watch,
	} = useCreatePoemForm({
		onCreated: async (createdPoem) => {
			const fileToUpload =
				selectedAudioFile ??
				(recordedBlob
					? new File(
							[recordedBlob],
							`poem-${createdPoem.id}-audio.${(recordedBlob.type || 'audio/webm').split('/')[1] || 'webm'}`,
							{ type: recordedBlob.type || 'audio/webm' },
						)
					: null);

			if (!fileToUpload) return;
			setIsUploadingAudio(true);
			setAudioError('');

			try {
				const audioUrl = await uploadPoemAudioFile(createdPoem.id, fileToUpload);
				await api.poems.updatePoemAudio.mutate({
					poemId: String(createdPoem.id),
					audioUrl,
				});

				handleDiscardRecording();
				handleClearSelectedFile();

				toaster.create({
					type: 'success',
					title: 'Audio salvo',
					closable: true,
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Erro ao enviar audio.';
				setAudioError(message);
			} finally {
				setIsUploadingAudio(false);
			}
		},
	});
	const { users, isLoadingUsers, isUsersError } = useUsersPreview();
	const preview = watch();
	const titleLength = preview?.title?.length ?? 0;
	const excerptLength = preview?.excerpt?.length ?? 0;
	const contentLength = preview?.content?.length ?? 0;

	const isTitleBelowMinLength = titleLength < POEM_TITLE_MIN_LENGTH;
	const isExcerptBelowMinLength = excerptLength < POEM_EXCERPT_MIN_LENGTH;
	const isContentBelowMinLength = contentLength < POEM_CONTENT_MIN_LENGTH;

	const previewPoem = {
		title: preview?.title || 'Tí­tulo do poema',
		excerpt: preview?.excerpt || '',
		content: preview?.content || '',
		tags: preview?.tags || [],
		status: preview?.status || 'draft',
		createdAt: new Date().toISOString(),
	};

	const isEmptyPreview = !preview?.title && !preview?.excerpt && !preview?.content;

	return (
		<>
			<FormCard
				as='form'
				w='full'
				maxW='4xl'
				direction='column'
				gap={3}
				onSubmit={handleSubmit(onSubmit)}
			>
				{generalError && <Text color='red.500'>{generalError}</Text>}

				<FieldContainer delay={40} hasError={!!errors.title}>
					<FormField
						label='Tí­tulo'
						required
						error={errors.title}
						control={control}
						name='title'
						maxLength={POEM_TITLE_MAX_LENGTH}
					/>
					<Text
						textStyle='small'
						color={isTitleBelowMinLength ? 'error' : 'pink.300'}
						textAlign='right'
						mt={1}
					>
						{titleLength}/{POEM_TITLE_MAX_LENGTH} caracteres
					</Text>
				</FieldContainer>

				<FieldContainer delay={120} hasError={!!errors.excerpt}>
					<FormField
						label='Resumo'
						as='textarea'
						rows={5}
						control={control}
						name='excerpt'
						error={errors.excerpt}
						maxLength={POEM_EXCERPT_MAX_LENGTH}
					/>
					<Text
						textStyle='small'
						color={isExcerptBelowMinLength ? 'error' : 'pink.300'}
						textAlign='right'
						mt={1}
					>
						{excerptLength}/{POEM_EXCERPT_MAX_LENGTH} caracteres
					</Text>
				</FieldContainer>

				<FieldContainer delay={200} hasError={!!errors.content}>
					<FormField
						label='Conteúdo (Markdown)'
						required
						as='textarea'
						rows={20}
						control={control}
						name='content'
						error={errors.content}
						maxLength={POEM_CONTENT_MAX_LENGTH}
					/>
					<Text
						textStyle='small'
						color={isContentBelowMinLength ? 'error' : 'pink.300'}
						textAlign='right'
						mt={1}
					>
						{contentLength}/{POEM_CONTENT_MAX_LENGTH} caracteres
					</Text>
				</FieldContainer>

				<FieldContainer delay={280} hasError={!!errors.tags}>
					<TagsField
						label='Tags'
						control={control}
						name='tags'
						error={errors.tags}
						disabled={isPending}
						maxTags={POEM_TAGS_MAX_AMOUNT}
						maxTagLength={POEM_TAG_MAX_LENGTH}
						placeholder='Adicione suas tags'
					/>
				</FieldContainer>

				<FieldContainer delay={360} hasError={!!errors.status}>
					<SelectField
						label='Status'
						name='status'
						control={control}
						options={[
							{ value: 'draft', label: 'Rascunho' },
							{ value: 'published', label: 'Publicado' },
						]}
						error={errors.status}
					/>
				</FieldContainer>

				<FieldContainer delay={440} hasError={!!errors.visibility}>
					<SelectField
						label='Visibilidade'
						name='visibility'
						control={control}
						options={[
							{ value: 'public', label: 'Público' },
							{ value: 'friends', label: 'Amigos' },
							{ value: 'private', label: 'Privado' },
							{ value: 'unlisted', label: 'Não listado' },
						]}
						error={errors.visibility}
					/>
				</FieldContainer>

				<FieldContainer delay={520} hasError={!!errors.isCommentable}>
					<SelectField
						label='Comentários'
						name='isCommentable'
						control={control}
						options={[
							{ value: 'true', label: 'Permitidos' },
							{ value: 'false', label: 'Desativados' },
						]}
						transformValue={(value) => value === 'true'}
						error={errors.isCommentable}
					/>
				</FieldContainer>

				<FieldContainer delay={600} hasError={!!errors.toUserIds}>
					<UserDedicationCombobox
						name='toUserIds'
						control={control}
						users={users}
						error={errors.toUserIds}
						disabled={isPending || isLoadingUsers}
						isLoading={isLoadingUsers}
					/>
				</FieldContainer>
				{isUsersError && (
					<Text textStyle='small' color='red.400'>
						Erro ao carregar usuários para dedicação.
					</Text>
				)}

				<FieldContainer delay={680} hasError={!!audioError}>
					<Box>
						<Text textStyle='small' color='pink.200' mb={2}>
							Audio do poema (opcional)
						</Text>

						{recordedUrl && (
							<Box mb={3}>
								<Text textStyle='smaller' color='pink.200' mb={2}>
									Preview da gravacao
								</Text>
								<audio controls preload='metadata' src={recordedUrl} />
							</Box>
						)}
						{selectedAudioUrl && (
							<Box mb={3}>
								<Text textStyle='smaller' color='pink.200' mb={2}>
									Preview do arquivo
								</Text>
								<audio controls preload='metadata' src={selectedAudioUrl} />
							</Box>
						)}

						<Flex gap={2} wrap='wrap'>
							<Button
								size='sm'
								variant='solidPink'
								onClick={handleStartRecording}
								disabled={isRecording || isUploadingAudio || isPending}
							>
								Gravar
							</Button>
							<Button
								size='sm'
								variant='outlinePurple'
								onClick={handleStopRecording}
								disabled={!isRecording || isUploadingAudio || isPending}
							>
								Parar
							</Button>
							<Button
								size='sm'
								variant='ghost'
								onClick={handleDiscardRecording}
								disabled={!recordedBlob || isUploadingAudio || isPending}
							>
								Descartar
							</Button>
							<Button
								size='sm'
								variant='surface'
								onClick={() => audioFileInputRef.current?.click()}
								disabled={isUploadingAudio || isPending}
							>
								Enviar arquivo
							</Button>
							<Button
								size='sm'
								variant='ghost'
								onClick={handleClearSelectedFile}
								disabled={!selectedAudioFile || isUploadingAudio || isPending}
							>
								Limpar arquivo
							</Button>
						</Flex>
						<input
							ref={audioFileInputRef}
							type='file'
							accept='audio/*'
							hidden
							onChange={handleAudioFileChange}
						/>

						{selectedAudioFile && (
							<Text textStyle='smaller' color='pink.200' mt={2}>
								Arquivo selecionado: {selectedAudioFile.name}
							</Text>
						)}

						{audioError && (
							<Text textStyle='small' color='red.400' mt={2}>
								{audioError}
							</Text>
						)}
					</Box>
				</FieldContainer>

				<FormButton isValid={isValid} loading={isPending} variant='surface'>
					Criar Poema
				</FormButton>
			</FormCard>

			<Heading as='h2' textStyle='h2' mt={12}>
				Preview
			</Heading>

			<Box as='section' maxW='4xl' w='full'>
				{isEmptyPreview ? (
					<Box textStyle='body' color='gray.500'>
						Preencha o formulário para ver o preview do poema
					</Box>
				) : (
					<>
						<PoemHeader
							poem={{
								title: previewPoem.title,
								excerpt: previewPoem.excerpt,
								tags: previewPoem.tags.map((tag: string, index: number) => ({
									id: index,
									name: tag,
								})),
								createdAt: previewPoem.createdAt,
								updatedAt: previewPoem.createdAt,
							}}
						/>

						<Box
							as='article'
							textAlign='justify'
							mt={50}
							whiteSpace='pre-wrap'
							wordBreak='break-word'
							textStyle='small'
						>
							<MarkdownRenderer content={previewPoem.content} />
						</Box>
					</>
				)}

				<Box
					mt={8}
					w='full'
					justifyContent={['end', undefined, undefined, 'center']}
					display='flex'
				></Box>
			</Box>
		</>
	);
}
