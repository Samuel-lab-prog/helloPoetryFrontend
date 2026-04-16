import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useEffect } from 'react';
import { isRouteErrorResponse, NavLink, useLocation, useRouteError } from 'react-router-dom';

type ErrorInfo = {
	status?: number;
	code?: string;
	message: string;
	description: string;
	recoveryTo: string;
	recoveryLabel: string;
};

type RouteErrorTelemetry = {
	kind: 'route_error_page';
	path: string;
	status?: number;
	code?: string;
	message: string;
	description: string;
	timestamp: string;
	rawError?: unknown;
};

function sendErrorTelemetry(payload: RouteErrorTelemetry) {
	console.error('[route-error]', payload);

	const endpoint = import.meta.env.VITE_ERROR_TELEMETRY_URL;
	if (!endpoint) return;

	try {
		const body = JSON.stringify(payload);

		if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
			const blob = new Blob([body], { type: 'application/json' });
			navigator.sendBeacon(endpoint, blob);
			return;
		}

		void fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
			keepalive: true,
		});
	} catch {
		// Never break the UI due to telemetry transport errors.
	}
}

function getErrorInfo(error: unknown): ErrorInfo {
	if (isRouteErrorResponse(error)) {
		if (error.status === 401) {
			return {
				status: 401,
				message: 'Your session has expired.',
				description: 'Please sign in again to continue.',
				recoveryTo: '/login',
				recoveryLabel: 'Sign in again',
			};
		}

		if (error.status === 403) {
			return {
				status: 403,
				message: 'You do not have permission to access this page.',
				description: 'Try with another account or go back to the home page.',
				recoveryTo: '/',
				recoveryLabel: 'Go to home',
			};
		}

		if (error.status === 404) {
			return {
				status: 404,
				message: 'This page does not exist.',
				description: 'Check the URL or go back to the home page.',
				recoveryTo: '/',
				recoveryLabel: 'Go to home',
			};
		}

		return {
			status: error.status,
			message: 'We could not load this page.',
			description: 'Please try again in a moment.',
			recoveryTo: '/',
			recoveryLabel: 'Go to home',
		};
	}

	if (error && typeof error === 'object') {
		const maybeError = error as { statusCode?: number; code?: string; message?: string };
		const status = maybeError.statusCode;

		if (status === 401) {
			return {
				status: 401,
				code: maybeError.code,
				message: 'Your session has expired.',
				description: 'Please sign in again to continue.',
				recoveryTo: '/login',
				recoveryLabel: 'Sign in again',
			};
		}

		if (status === 403) {
			return {
				status: 403,
				code: maybeError.code,
				message: 'Access denied for this action.',
				description: 'Try again with a different account.',
				recoveryTo: '/',
				recoveryLabel: 'Go to home',
			};
		}

		if (typeof maybeError.message === 'string' && maybeError.message.length > 0) {
			return {
				status,
				code: maybeError.code,
				message: 'Something went wrong.',
				description: maybeError.message,
				recoveryTo: '/',
				recoveryLabel: 'Go to home',
			};
		}
	}

	return {
		message: 'Something went wrong or this page does not exist.',
		description: 'Try going back to the home page or checking the URL.',
		recoveryTo: '/',
		recoveryLabel: 'Go back to the home page',
	};
}

export function ErrorPage() {
	const error = useRouteError();
	const location = useLocation();
	const clearAuthClient = useAuthClientStore((state) => state.clearAuthClient);
	const info = getErrorInfo(error);
	const shouldClearSession = info.status === 401;

	useEffect(() => {
		sendErrorTelemetry({
			kind: 'route_error_page',
			path: location.pathname,
			status: info.status,
			code: info.code,
			message: info.message,
			description: info.description,
			timestamp: new Date().toISOString(),
			rawError: error,
		});
	}, [error, info.code, info.description, info.message, info.status, location.pathname]);

	return (
		<Flex minH='100vh' align='center' justify='center' px={6} py={20} textAlign='center'>
			<Box maxW='md'>
				<Heading as='h1' textStyle='h2'>
					Ops!
				</Heading>

				<Heading as='h2' textStyle='h5' mt={3}>
					{info.message}
				</Heading>

				<Text textStyle='small' mt={1}>
					{info.description}
				</Text>

				{info.status && (
					<Text textStyle='smaller' mt={2} color='pink.200'>
						Error {info.status}
						{info.code ? ` (${info.code})` : ''}
					</Text>
				)}

				<Box mt={6}>
					<Button asChild variant='solidPink'>
						<NavLink
							to={info.recoveryTo}
							onClick={() => {
								if (shouldClearSession) clearAuthClient();
							}}
						>
							{info.recoveryLabel}
						</NavLink>
					</Button>
				</Box>
			</Box>
		</Flex>
	);
}
