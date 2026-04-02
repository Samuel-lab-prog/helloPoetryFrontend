import type { UserRole, UserStatus } from '../users/types';

export type AuthClient = {
	id: number;
	role: UserRole;
	status: UserStatus;
};

export type LoginBody = {
	email: string;
	password: string;
};
