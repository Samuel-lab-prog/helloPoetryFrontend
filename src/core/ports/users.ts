export type UsersCachePort = {
	getProfileKey: (userId: number | string) => readonly unknown[];
};

let usersCachePort: UsersCachePort | null = null;

export function registerUsersCachePort(port: UsersCachePort) {
	usersCachePort = port;
}

export function getUsersCachePort(): UsersCachePort {
	if (!usersCachePort) {
		throw new Error('UsersCachePort not registered. Register it in main.tsx.');
	}

	return usersCachePort;
}
