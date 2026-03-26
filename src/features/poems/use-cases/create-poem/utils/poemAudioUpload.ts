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
		return 'Invalid audio format. Use MP3, WAV, WEBM, OGG, AAC, or M4A.';
	}

	if (file.size > MAX_POEM_AUDIO_SIZE_BYTES) {
		return `Audio must be at most ${MAX_POEM_AUDIO_SIZE_MB}MB.`;
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
	const { uploadUrl, fileUrl, fields } = await api.poems.requestPoemAudioUploadUrl.mutate({
		poemId: String(poemId),
		contentType: normalizedType,
		contentLength: file.size,
	});

	if (!uploadUrl || uploadUrl === 'SIGNED_URL_PLACEHOLDER') {
		return fileUrl;
	}

	const hasPostFields = fields && Object.keys(fields).length > 0;
	const response = hasPostFields
		? await uploadViaPresignedPost(uploadUrl, fields, file)
		: await uploadViaPresignedPut(uploadUrl, normalizedType, file);

	if (!response.ok) {
		throw new Error('Error uploading audio.');
	}

	return fileUrl;
}

async function uploadViaPresignedPost(
	uploadUrl: string,
	fields: Record<string, string>,
	file: File,
) {
	const formData = new FormData();
	Object.entries(fields).forEach(([key, value]) => {
		formData.append(key, value);
	});
	formData.append('file', file);

	return fetch(uploadUrl, {
		method: 'POST',
		body: formData,
		credentials: 'omit',
	});
}

async function uploadViaPresignedPut(
	uploadUrl: string,
	contentType: string,
	file: File,
) {
	return fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': contentType,
		},
		body: file,
		credentials: 'omit',
	});
}
