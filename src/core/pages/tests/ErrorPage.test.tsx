// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeErrorPageScenario } from './makeErrorPageScenario';

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useLocation: vi.fn(),
		useRouteError: vi.fn(),
	};
});

describe('CORE PAGE - ErrorPage', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	it('shows a clear expired-session response and clears auth when the user follows recovery', async () => {
		const scenario = makeErrorPageScenario()
			.withAuthClientId(987)
			.withAppError({
				statusCode: 401,
				code: 'UNAUTHORIZED',
				message: 'session expired',
			})
			.atPath('/admin');

		scenario.render();

		expect(screen.getByText('Your session has expired.')).toBeTruthy();
		expect(screen.getByText('Please sign in again to continue.')).toBeTruthy();
		expect(screen.getByText('Error 401 (UNAUTHORIZED)')).toBeTruthy();

		const recoveryLink = screen.getByRole('link', { name: 'Sign in again' });
		expect(recoveryLink.getAttribute('href')).toBe('/login');

		fireEvent.click(recoveryLink);

		await waitFor(() =>
			expect(scenario.mocks.userLoggedOut).toHaveBeenCalledWith(
				'userLoggedOut',
				expect.objectContaining({
					userId: 987,
					reason: 'sessionExpired',
				}),
			),
		);
		expect(useAuthClientStore.getState().authClient).toBeNull();
	});

	it('keeps banned 401 errors distinct from ordinary session expiration', () => {
		makeErrorPageScenario()
			.asBannedUser()
			.withAppError({
				statusCode: 401,
				message: 'user banned',
			})
			.render();

		expect(
			screen.getByText(
				'This account has been banned, so account access is unavailable. If you think this is a mistake, please contact support.',
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				'Please use a different account or contact support if this seems incorrect.',
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to sign in' }).getAttribute('href')).toBe('/login');
		expect(screen.queryByText('Your session has expired.')).toBeNull();
	});

	it('shows the generic access-denied response for active users', () => {
		makeErrorPageScenario()
			.asActiveUser()
			.withAppError({
				statusCode: 403,
				code: 'FORBIDDEN',
				message: 'not allowed',
			})
			.render();

		expect(screen.getByText('Access denied for this action.')).toBeTruthy();
		expect(screen.getByText('Try again with a different account.')).toBeTruthy();
		expect(screen.getByText('Error 403 (FORBIDDEN)')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
	});

	it('uses suspended-user copy for 403 errors when the current account is suspended', () => {
		makeErrorPageScenario()
			.asSuspendedUser()
			.withAppError({
				statusCode: 403,
				message: 'not allowed',
			})
			.render();

		expect(
			screen.getByText('Some account privileges are unavailable while your account is suspended.'),
		).toBeTruthy();
		expect(
			screen.getByText(
				'You can still use available areas, such as notifications, while restricted privileges remain unavailable.',
			),
		).toBeTruthy();
		expect(screen.getByText('Error 403')).toBeTruthy();
	});

	it('uses banned-user copy for 403 errors when the current account is banned', () => {
		makeErrorPageScenario()
			.asBannedUser()
			.withAppError({
				statusCode: 403,
				message: 'not allowed',
			})
			.render();

		expect(
			screen.getByText(
				'This account has been banned, so account access is unavailable. If you think this is a mistake, please contact support.',
			),
		).toBeTruthy();
		expect(
			screen.getByText(
				'This account cannot use authenticated areas. Please use a different account or contact support if this seems incorrect.',
			),
		).toBeTruthy();
		expect(screen.getByText('Error 403')).toBeTruthy();
	});

	it('normalizes validation-shaped route errors into an expired-session response', () => {
		makeErrorPageScenario()
			.asActiveUser()
			.withRouteErrorResponse(422, {
				code: 'VALIDATION',
				message: 'Validation failed',
			})
			.render();

		expect(screen.getByText('Your session has expired.')).toBeTruthy();
		expect(screen.getByText('Please sign in again to continue.')).toBeTruthy();
		expect(screen.getByText('Error 401 (VALIDATION)')).toBeTruthy();
	});

	it('shows a clear not-found response for route 404 errors', () => {
		makeErrorPageScenario().withRouteErrorResponse(404).render();

		expect(screen.getByText('This page does not exist.')).toBeTruthy();
		expect(screen.getByText('Check the URL or go back to the home page.')).toBeTruthy();
		expect(screen.getByText('Error 404')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
	});

	it('records telemetry with the normalized message and current path', async () => {
		const scenario = makeErrorPageScenario()
			.asLoggedOutVisitor()
			.withAppError({
				statusCode: 500,
				code: 'SERVER_ERROR',
				message: 'Database unavailable',
			})
			.atPath('/poems/unknown');

		scenario.render();

		await waitFor(() =>
			expect(scenario.mocks.errorTelemetry).toHaveBeenCalledWith(
				'[route-error]',
				expect.objectContaining({
					kind: 'route_error_page',
					path: '/poems/unknown',
					status: 500,
					code: 'SERVER_ERROR',
					message: 'Something went wrong.',
					description: 'Database unavailable',
				}),
			),
		);
	});
});
