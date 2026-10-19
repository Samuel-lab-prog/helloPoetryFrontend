export type AuthSessionIdentity = {
	id: number;
	status: string;
};

export type AuthSessionPort = {
	getCurrentIdentity: () => AuthSessionIdentity | null;
	getCurrentCacheScope: () => string;
	setUnreadNotificationsCount: (count: number) => void;
	clearAuthClient: () => void;
};

let authSessionPort: AuthSessionPort | null = null;

export function registerAuthSessionPort(port: AuthSessionPort): void {
	authSessionPort = port;
}

export function getAuthSessionPort(): AuthSessionPort {
	if (!authSessionPort) {
		throw new Error('AuthSessionPort not registered. Register it in main.tsx.');
	}
	return authSessionPort;
}
