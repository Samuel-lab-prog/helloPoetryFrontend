import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Navbar, ErrorPage, createHTTPRequest } from '@features/base';
import { PostPage, PostsPage, HomePage } from '@features/posts';
import { LoginPage, RegisterPage } from '@features/auth';
import { AdminPage, CreatePoemPage } from '@features/admin';

export default function App() {
	const { data: isAuthenticated = false } = useQuery({
		queryKey: ['auth-navbar'],
		queryFn: async () => {
			try {
				await createHTTPRequest<void>({
					path: '/auth',
					method: 'POST',
					credentials: 'include',
				});
				return true;
			} catch {
				return false;
			}
		},
		staleTime: 1000 * 60 * 5,
		retry: false,
	});

	const navLinks = [
		{ to: '/', label: 'Home' },
		{ to: '/poems', label: 'Poems' },
		...(isAuthenticated ? [{ to: '/poems/new', label: 'Create Poem' }] : []),
		{ label: 'Register', to: '/register' },
		{ label: 'Login', to: '/login' },
	];

	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: 'poems', element: <PostsPage /> },
				{ path: 'poems/:slug/:id', element: <PostPage /> },
				{ path: '/login', element: <LoginPage /> },
				{ path: '/register', element: <RegisterPage /> },
				{
					path: 'poems/new',
					element: <CreatePoemPage />,
				},
				{
					path: 'admin',
					element: <AdminPage />,
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}
