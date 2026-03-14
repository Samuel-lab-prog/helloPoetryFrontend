export type AuthClient = {
	id: number;
	role: string;
	status: string;
};

export type LoginBody = {
	email: string;
	password: string;
};
