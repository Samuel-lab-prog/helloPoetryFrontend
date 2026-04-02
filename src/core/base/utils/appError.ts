/**
 * Canonical shape for application errors surfaced by HTTP helpers and adapters.
 */
export type AppErrorType = {
	statusCode: number;
	message: string;
	code: string;
};

/**
 * Error wrapper that standardizes API errors across the app.
 */
export class AppError extends Error {
	public statusCode: number;
	public message: string;
	public code: string;

	/**
	 * Creates a typed error instance from a raw error payload.
	 */
	constructor({ statusCode, message, code }: AppErrorType) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.message = message;
		this.code = code;
	}
}
