import { users } from '@Api/users/endpoints';

const MAX_AVATAR_SIZE_BYTES_PER_MB = 1_000_000;
const allowedImageTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]);

export const MAX_AVATAR_SIZE_MB = 5;
export const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * MAX_AVATAR_SIZE_BYTES_PER_MB;

const AVATAR_UPLOAD_ERROR_MESSAGE =
	"We couldn't upload your avatar. Check your connection and try again.";
const AVATAR_TOO_LARGE_MESSAGE = `Choose an image up to ${MAX_AVATAR_SIZE_MB}MB.`;
const AVATAR_UNSUPPORTED_TYPE_MESSAGE = 'Unsupported image format. Use JPG, PNG, WEBP, or GIF.';

export function getAvatarFileError(file: File): string | null {
	if (!allowedImageTypes.has(file.type.toLowerCase())) return AVATAR_UNSUPPORTED_TYPE_MESSAGE;

	if (file.size > MAX_AVATAR_SIZE_BYTES) return AVATAR_TOO_LARGE_MESSAGE;

	return null;
}

export function isValidAvatarFile(file: File) {
	return getAvatarFileError(file) === null;
}

export async function uploadAvatarFile(file: File): Promise<string> {
	const error = getAvatarFileError(file);
	if (error) throw new Error(error);

	try {
		const { uploadUrl, fileUrl, fields } = await users.requestAvatarUploadUrl.mutate({
			contentType: file.type,
			contentLength: file.size,
		});

		if (!uploadUrl || uploadUrl === 'SIGNED_URL_PLACEHOLDER') return fileUrl;

		const hasPostFields = fields && Object.keys(fields).length > 0;
		const response = hasPostFields
			? await uploadViaPresignedPost(uploadUrl, fields, file)
			: await uploadViaPresignedPut(uploadUrl, file);

		if (!response.ok) throw new Error(AVATAR_UPLOAD_ERROR_MESSAGE);

		return fileUrl;
	} catch (err) {
		throw new Error(getAvatarUploadErrorMessage(err));
	}
}

function getAvatarUploadErrorMessage(err: unknown) {
	if (isAppErrorLike(err)) {
		const message = err.message.toLowerCase();
		if (
			message.includes('content length') ||
			message.includes('maximum') ||
			message.includes('exceeds')
		) {
			return AVATAR_TOO_LARGE_MESSAGE;
		}

		if (message.includes('content type')) return AVATAR_UNSUPPORTED_TYPE_MESSAGE;

		return AVATAR_UPLOAD_ERROR_MESSAGE;
	}

	if (!(err instanceof Error)) return AVATAR_UPLOAD_ERROR_MESSAGE;

	const message = err.message.trim();
	const normalizedMessage = message.toLowerCase();

	if (
		!message ||
		normalizedMessage === 'failed to fetch' ||
		normalizedMessage.includes('network')
	) {
		return AVATAR_UPLOAD_ERROR_MESSAGE;
	}

	return message;
}

function isAppErrorLike(err: unknown): err is { message: string; statusCode: number } {
	if (!err || typeof err !== 'object') return false;
	const candidate = err as { message?: unknown; statusCode?: unknown };
	return typeof candidate.message === 'string' && typeof candidate.statusCode === 'number';
}

function uploadViaPresignedPost(uploadUrl: string, fields: Record<string, string>, file: File) {
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

function uploadViaPresignedPut(uploadUrl: string, file: File) {
	return fetch(uploadUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
		},
		body: file,
		credentials: 'omit',
	});
}
