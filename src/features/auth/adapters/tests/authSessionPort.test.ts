// @vitest-environment happy-dom
import {
	clearTestAuthClient,
	getTestUnreadNotificationsCount,
	setTestAuthClient,
} from '@root/test-support/authClientStore';

import { authSessionPort } from '../authSessionPort';

describe('AuthSessionPort adapter', () => {
	afterEach(() => {
		clearTestAuthClient();
	});

	it('exposes the current identity and user-specific cache scope', () => {
		setTestAuthClient({ id: 41, role: 'author', status: 'active' });

		expect(authSessionPort.getCurrentIdentity()).toEqual({ id: 41, status: 'active' });
		expect(authSessionPort.getCurrentCacheScope()).toBe('user:41:active');

		setTestAuthClient({ id: 82, role: 'author', status: 'active' });
		expect(authSessionPort.getCurrentCacheScope()).toBe('user:82:active');
	});

	it('updates unread notifications and clears the authentication store', () => {
		setTestAuthClient({ id: 41, role: 'author', status: 'active' });

		authSessionPort.setUnreadNotificationsCount(6);
		expect(getTestUnreadNotificationsCount()).toBe(6);

		authSessionPort.clearAuthClient();
		expect(authSessionPort.getCurrentIdentity()).toBeNull();
		expect(authSessionPort.getCurrentCacheScope()).toBe('anonymous');
	});
});
