import {
	clearTestAuthClient,
	setTestAuthClient,
	setTestAuthStatus,
} from '@root/core/testing/authClientStore';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { useLocation, useRouteError } from 'react-router-dom';
import { vi } from 'vitest';

import { eventBus } from '../../events/eventBus';
import { ErrorPage } from '../Error';

type AppError = {
	statusCode?: number;
	code?: string;
	message?: string;
};

function setRouteContext(error: unknown, path: string) {
	vi.mocked(useRouteError).mockReturnValue(error);
	vi.mocked(useLocation).mockReturnValue({
		pathname: path,
		search: '',
		hash: '',
		state: null,
		key: 'test-location',
	});
}

export function makeRouteErrorResponse(
	status: number,
	data: { code?: string; message?: string } = {},
) {
	return {
		status,
		statusText: '',
		internal: false,
		data,
	};
}

export function makeErrorPageScenario() {
	let error: unknown = {
		statusCode: 500,
		message: 'Unexpected failure.',
	};
	let path = '/protected';
	const mocks = {
		errorTelemetry: vi.spyOn(console, 'error').mockImplementation(() => undefined),
		userLoggedOut: vi.spyOn(eventBus, 'publish').mockResolvedValue(undefined),
	};

	const scenario = {
		mocks,
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asActiveUser() {
			setTestAuthStatus('active');
			return scenario;
		},
		asSuspendedUser() {
			setTestAuthStatus('suspended');
			return scenario;
		},
		asBannedUser() {
			setTestAuthStatus('banned');
			return scenario;
		},
		withAuthClientId(id: number) {
			setTestAuthClient({
				id,
				role: 'author',
				status: 'active',
			});
			return scenario;
		},
		atPath(nextPath: string) {
			path = nextPath;
			return scenario;
		},
		withAppError(nextError: AppError) {
			error = nextError;
			return scenario;
		},
		withRouteErrorResponse(status: number, data: { code?: string; message?: string } = {}) {
			error = makeRouteErrorResponse(status, data);
			return scenario;
		},
		render() {
			setRouteContext(error, path);
			return renderWithProviders(<ErrorPage />, { route: path });
		},
	};

	return scenario;
}
