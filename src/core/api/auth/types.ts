import type { UserRole, UserStatus } from '@Api/users/types';

export type AuthClient = {
	id: number;
	role: UserRole;
	status: UserStatus;
};

export type LoginBody = {
	email: string;
	password: string;
};
