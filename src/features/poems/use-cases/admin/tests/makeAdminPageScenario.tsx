import { clearTestAuthClient, setTestAuthStatus } from '@root/core/testing/authClientStore';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';

import { AdminPage } from '../Page';

export function makeAdminPageScenario() {
	let route = '/admin';
	const scenario = {
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asActiveAuthor() {
			setTestAuthStatus('active');
			return scenario;
		},
		asSuspendedAuthor() {
			setTestAuthStatus('suspended');
			return scenario;
		},
		asBannedAuthor() {
			setTestAuthStatus('banned');
			return scenario;
		},
		withMode(mode: 'create' | 'update' | 'delete') {
			route = `/admin?mode=${mode}`;
			return scenario;
		},
		render() {
			return renderWithProviders(<AdminPage />, { route });
		},
	};

	return scenario;
}
