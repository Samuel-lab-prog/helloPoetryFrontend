import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Navbar, ErrorPage } from '@features/base';
import { PostPage, PostsPage, HomePage } from '@features/posts';
import { LoginPage, MyProfilePage, RegisterPage } from '@features/auth';
import { AdminPage, CreatePoemPage } from '@features/admin';

export default function App() {
	const isAuthenticated = !!localStorage.getItem('auth-client');

	const navLinks = [
		{ to: '/', label: 'Home' },
		{ to: '/poems', label: 'Poems' },
		...(isAuthenticated ? [{ to: '/poems/new', label: 'Create Poem' }] : []),
		...(isAuthenticated ? [{ to: '/my-profile', label: 'My Profile' }] : []),
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
				{
					path: 'my-profile',
					element: <MyProfilePage />,
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}
