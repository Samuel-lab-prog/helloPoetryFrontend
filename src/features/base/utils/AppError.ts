export type AppErrorType = {
	statusCode?: number;
	message?: string;
	code?: string;
};

export class AppError extends Error {
	public statusCode: number;
	public message: string;
	public code: string;

	constructor({
		statusCode = 500,
		message = 'Erro na aplicação',
		code = 'INTERNAL_SERVER_ERROR',
	}: AppErrorType = {}) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.message = message;
		this.code = code;
	}
}
