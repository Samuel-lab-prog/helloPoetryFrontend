export type AppErrorType = {
	statusCode: number;
	message: string;
	code: string;
};

export class AppError extends Error {
	public statusCode: number;
	public message: string;
	public code: string;

	constructor({ statusCode, message, code }: AppErrorType) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.message = message;
		this.code = code;
	}
}
