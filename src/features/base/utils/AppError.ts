export type AppErrorType = {
	statusCode?: number;
	errorMessages?: string[];
};

export class AppError extends Error {
	public statusCode: number;
	public errorMessages: string[];
	public originalError?: Error;

	constructor({
		statusCode = 500,
		errorMessages = ['Erro na aplicação'],
	}: AppErrorType = {}) {
		super(errorMessages.join(', '));

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.errorMessages = errorMessages;
	}
}
