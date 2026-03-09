import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'auth-client';

export type AuthClient = {
	id: number;
	role: string;
	status: string;
};

type PersistedAuthState = {
	authClient: AuthClient | null;
	unreadNotificationsCount: number;
};

type AuthClientState = {
	authClient: AuthClient | null;
	unreadNotificationsCount: number;
	setAuthClient: (client: AuthClient) => void;
	setUnreadNotificationsCount: (count: number) => void;
	decrementUnreadNotificationsCount: (amount?: number) => void;
	clearAuthClient: () => void;
	hydrateAuthClient: () => void;
};

function parseAuthClient(raw: string | null): AuthClient | null {
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as Partial<AuthClient>;
		const id = Number(parsed.id);
		if (!Number.isFinite(id) || id <= 0) return null;
		if (typeof parsed.role !== 'string' || typeof parsed.status !== 'string') return null;
		return {
			id,
			role: parsed.role,
			status: parsed.status,
		};
	} catch {
		return null;
	}
}

function parsePersistedState(raw: string | null): PersistedAuthState {
	if (!raw) return { authClient: null, unreadNotificationsCount: 0 };

	try {
		const parsed = JSON.parse(raw) as Partial<PersistedAuthState> | Partial<AuthClient> | null;

		if (!parsed || typeof parsed !== 'object')
			return { authClient: null, unreadNotificationsCount: 0 };

		if ('authClient' in parsed) {
			const authClient =
				parsed.authClient && typeof parsed.authClient === 'object'
					? parseAuthClient(JSON.stringify(parsed.authClient))
					: null;
			const unreadNotificationsCount =
				typeof parsed.unreadNotificationsCount === 'number' &&
				Number.isFinite(parsed.unreadNotificationsCount) &&
				parsed.unreadNotificationsCount >= 0
					? Math.floor(parsed.unreadNotificationsCount)
					: 0;
			return { authClient, unreadNotificationsCount };
		}

		const legacyClient = parseAuthClient(JSON.stringify(parsed));
		return {
			authClient: legacyClient,
			unreadNotificationsCount: 0,
		};
	} catch {
		return { authClient: null, unreadNotificationsCount: 0 };
	}
}

function readPersistedStateFromStorage(): PersistedAuthState {
	if (typeof window === 'undefined') return { authClient: null, unreadNotificationsCount: 0 };
	return parsePersistedState(window.localStorage.getItem(AUTH_STORAGE_KEY));
}

function persistState(authClient: AuthClient | null, unreadNotificationsCount: number) {
	if (typeof window === 'undefined') return;
	const safeUnread = Math.max(0, Math.floor(unreadNotificationsCount));
	const payload: PersistedAuthState = { authClient, unreadNotificationsCount: safeUnread };
	window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export const useAuthClientStore = create<AuthClientState>((set) => ({
	authClient: readPersistedStateFromStorage().authClient,
	unreadNotificationsCount: readPersistedStateFromStorage().unreadNotificationsCount,
	setAuthClient: (client) => {
		set((state) => {
			persistState(client, state.unreadNotificationsCount);
			return { authClient: client };
		});
	},
	setUnreadNotificationsCount: (count) => {
		set((state) => {
			const safeCount = Math.max(0, Math.floor(count));
			persistState(state.authClient, safeCount);
			return { unreadNotificationsCount: safeCount };
		});
	},
	decrementUnreadNotificationsCount: (amount = 1) => {
		set((state) => {
			const safeAmount = Math.max(0, Math.floor(amount));
			const nextCount = Math.max(0, state.unreadNotificationsCount - safeAmount);
			persistState(state.authClient, nextCount);
			return { unreadNotificationsCount: nextCount };
		});
	},
	clearAuthClient: () => {
		set({ authClient: null, unreadNotificationsCount: 0 });
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(AUTH_STORAGE_KEY);
		}
	},
	hydrateAuthClient: () => {
		const persisted = readPersistedStateFromStorage();
		set({
			authClient: persisted.authClient,
			unreadNotificationsCount: persisted.unreadNotificationsCount,
		});
	},
}));
