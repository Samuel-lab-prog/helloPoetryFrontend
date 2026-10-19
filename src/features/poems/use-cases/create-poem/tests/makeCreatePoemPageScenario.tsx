import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { clearTestAuthClient, setTestAuthStatus } from '@root/test-support/authClientStore';

import { CreatePoemPage } from '../Page';

export function makeCreatePoemPageScenario() {
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
		render() {
			return renderWithProviders(<CreatePoemPage />, { route: '/poems/create' });
		},
	};

	return scenario;
}
