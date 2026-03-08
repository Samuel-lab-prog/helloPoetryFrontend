import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'auth-client';

export type AuthClient = {
	id: number;
	role: string;
	status: string;
};

type AuthClientState = {
	authClient: AuthClient | null;
	setAuthClient: (client: AuthClient) => void;
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

function readAuthClientFromStorage(): AuthClient | null {
	if (typeof window === 'undefined') return null;
	return parseAuthClient(window.localStorage.getItem(AUTH_STORAGE_KEY));
}

export const useAuthClientStore = create<AuthClientState>((set) => ({
	authClient: readAuthClientFromStorage(),
	setAuthClient: (client) => {
		set({ authClient: client });
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(client));
		}
	},
	clearAuthClient: () => {
		set({ authClient: null });
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(AUTH_STORAGE_KEY);
		}
	},
	hydrateAuthClient: () => {
		set({ authClient: readAuthClientFromStorage() });
	},
}));
