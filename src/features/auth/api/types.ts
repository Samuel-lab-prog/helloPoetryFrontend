import type { UserRole, UserStatus } from '@root/features/users/api/types';

export type AuthClient = {
	id: number;
	role: UserRole;
	status: UserStatus;
};

export type LoginBody = {
	email: string;
	password: string;
};
