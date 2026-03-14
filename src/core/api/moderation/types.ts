export type BanUserBody = {
	userId: string;
	reason: string;
};

export type SuspendUserBody = {
	userId: string;
	reason: string;
};

export type BannedUserResponse = {
	id: number;
	moderatorId: number;
	bannedUserId: number;
	reason: string;
	bannedAt: string;
};

export type SuspendedUserResponse = {
	id: number;
	moderatorId: number;
	suspendedUserId: number;
	reason: string;
	suspendedAt: string;
	endAt: string;
};
