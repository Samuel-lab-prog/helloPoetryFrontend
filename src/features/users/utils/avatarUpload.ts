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

	const { uploadUrl, fileUrl } = await api.users.requestAvatarUploadUrl.mutate({
		contentType: file.type,
	});

	if (!uploadUrl || uploadUrl === 'SIGNED_URL_PLACEHOLDER') {
		return fileUrl;
	}

	const response = await fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
		},
		body: file,
		credentials: 'omit',
	});

	if (!response.ok) {
		throw new Error('Erro ao enviar avatar.');
	}

	return fileUrl;
}
