import { create } from 'zustand';

export type UserMyProfileSnapshot = {
	id: number;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl: string | null;
	role: string;
	status: string;
	email: string;
	emailVerifiedAt: string | null;
	stats: {
		poems: {
			id: number;
			title: string;
		}[];
		friends: {
			id: number;
		}[];
	};
	blockedUsersIds: number[];
};

export type UserLoginBootstrap = {
	userPoems: {
		id: number;
		title: string;
	}[];
	friends: {
		id: number;
	}[];
	profile: {
		id: number;
		name: string;
		nickname: string;
		bio: string;
		avatarUrl: string | null;
		role: string;
		status: string;
		email: string;
		emailVerifiedAt: string | null;
		blockedUsersIds: number[];
	};
};

type UserBootstrapState = {
	bootstrap: UserLoginBootstrap | null;
	setBootstrap: (bootstrap: UserLoginBootstrap) => void;
	clearBootstrap: () => void;
};

export const useUserBootstrapStore = create<UserBootstrapState>((set) => ({
	bootstrap: null,
	setBootstrap: (bootstrap) => set({ bootstrap }),
	clearBootstrap: () => set({ bootstrap: null }),
}));
