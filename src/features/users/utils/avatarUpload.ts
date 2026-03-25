import { api } from '@root/core/api';

const allowedImageTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]);

export const MAX_AVATAR_SIZE_MB = 5;
export const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;

export function getAvatarFileError(file: File): string | null {
	if (!allowedImageTypes.has(file.type.toLowerCase())) {
		return 'Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.';
	}

	if (file.size > MAX_AVATAR_SIZE_BYTES) {
		return `A imagem deve ter no máximo ${MAX_AVATAR_SIZE_MB}MB.`;
	}

	return null;
}

export function isValidAvatarFile(file: File) {
	return getAvatarFileError(file) === null;
}

export async function uploadAvatarFile(file: File): Promise<string> {
	const error = getAvatarFileError(file);
	if (error) throw new Error(error);

	const { uploadUrl, fileUrl, fields } = await api.users.requestAvatarUploadUrl.mutate({
		contentType: file.type,
		contentLength: file.size,
	});

	if (!uploadUrl || uploadUrl === 'SIGNED_URL_PLACEHOLDER') {
		return fileUrl;
	}

	const hasPostFields = fields && Object.keys(fields).length > 0;
	const response = hasPostFields
		? await uploadViaPresignedPost(uploadUrl, fields, file)
		: await uploadViaPresignedPut(uploadUrl, file);

	if (!response.ok) {
		throw new Error('Erro ao enviar avatar.');
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

async function uploadViaPresignedPut(uploadUrl: string, file: File) {
	return fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
		},
		body: file,
		credentials: 'omit',
	});
}
