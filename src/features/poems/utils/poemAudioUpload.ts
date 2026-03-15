import { api } from '@root/core/api';

const allowedAudioTypes = new Set([
	'audio/mpeg',
	'audio/mp3',
	'audio/wav',
	'audio/x-wav',
	'audio/webm',
	'audio/ogg',
	'audio/aac',
	'audio/mp4',
	'audio/x-m4a',
]);

const extensionToType: Record<string, string> = {
	mp3: 'audio/mpeg',
	wav: 'audio/wav',
	webm: 'audio/webm',
	ogg: 'audio/ogg',
	aac: 'audio/aac',
	m4a: 'audio/mp4',
};

export const MAX_POEM_AUDIO_SIZE_MB = 20;
export const MAX_POEM_AUDIO_SIZE_BYTES = MAX_POEM_AUDIO_SIZE_MB * 1024 * 1024;

function normalizeAudioType(type: string) {
	return type.toLowerCase().split(';')[0] || '';
}

function resolveAudioContentType(file: File): string {
	const normalizedType = normalizeAudioType(file.type);
	if (normalizedType) return normalizedType;

	const parts = file.name.toLowerCase().split('.');
	const ext = parts.length > 1 ? parts.at(-1) : '';
	if (ext && extensionToType[ext]) return extensionToType[ext];

	return '';
}

export function getPoemAudioFileError(file: File): string | null {
	const normalizedType = resolveAudioContentType(file);

	if (!allowedAudioTypes.has(normalizedType)) {
		return 'Formato de audio invalido. Use MP3, WAV, WEBM, OGG, AAC ou M4A.';
	}

	if (file.size > MAX_POEM_AUDIO_SIZE_BYTES) {
		return `O audio deve ter no maximo ${MAX_POEM_AUDIO_SIZE_MB}MB.`;
	}

	return null;
}

export function isValidPoemAudioFile(file: File) {
	return getPoemAudioFileError(file) === null;
}

export async function uploadPoemAudioFile(poemId: number, file: File): Promise<string> {
	const error = getPoemAudioFileError(file);
	if (error) throw new Error(error);

	const normalizedType = resolveAudioContentType(file);
	const { uploadUrl, fileUrl } = await api.poems.requestPoemAudioUploadUrl.mutate({
		poemId: String(poemId),
		contentType: normalizedType,
	});

	if (!uploadUrl || uploadUrl === 'SIGNED_URL_PLACEHOLDER') {
		return fileUrl;
	}

	const response = await fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': normalizedType,
		},
		body: file,
		credentials: 'omit',
	});

	if (!response.ok) {
		throw new Error('Erro ao enviar audio.');
	}

	return fileUrl;
}
