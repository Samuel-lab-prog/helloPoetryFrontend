import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Center, Spinner, Heading, Text } from '@chakra-ui/react';
import { createHTTPRequest, type AppError } from '@features/base';

export function ProtectedRoutePage() {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

	const { mutateAsync: authenticate } = useMutation({
		mutationFn: () =>
			createHTTPRequest<void>({
				path: '/auth',
				method: 'POST',
				credentials: 'include',
			}),
	});

	useEffect(() => {
		async function authUser() {
			try {
				await authenticate();
				setIsAuthenticated(true);
			} catch (error: unknown) {
				const typedError = error as AppError;
				if (typedError.statusCode === 401) {
					navigate('/');
				}
				setIsAuthenticated(false);
			}
		}

		authUser();
	}, [authenticate, navigate]);

	if (isAuthenticated === null) {
		return (
			<Center h='100vh'>
				<Spinner size='xl' />
				<Text ml={4}>Carregando...</Text>
			</Center>
		);
	}

	return isAuthenticated ? (
		<Outlet />
	) : (
		<Center
			h='100vh'
			flexDirection='column'
		>
			<Heading
				mb={4}
				size='lg'
			>
				Boa tentativa!
			</Heading>
			<Text>Você não tem acesso a esta página.</Text>
		</Center>
	);
}
