import { clearTestAuthClient, setTestAuthStatus } from '@root/core/testing/authClientStore';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';

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
