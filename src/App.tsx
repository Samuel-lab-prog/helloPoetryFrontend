import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Navbar, ErrorPage } from '@features/base';
import { HomePage, PoemPage, PoemsPage } from '@features/poems';
import { LoginPage, RegisterPage } from '@features/auth';

import {
	AuthorPage,
	MyProfilePage,
	NotificationsPage,
	PoetsPage,
} from '@features/users';

import { AdminPage, CreatePoemPage } from '@features/admin';

export default function App() {
	const isAuthenticated = !!localStorage.getItem('auth-client');

	const navLinks = [
		{ to: '/', label: 'Início' },
		{ to: '/poems', label: 'Poemas' },
		{ to: '/poets', label: 'Poetas' },
		...(isAuthenticated ? [{ to: '/poems/new', label: 'Criar' }] : []),
		...(isAuthenticated ? [{ to: '/my-profile', label: 'Meu Perfil' }] : []),
		...(isAuthenticated
			? [{ to: '/notifications', label: 'Notificações' }]
			: []),
		...(!isAuthenticated ? [{ label: 'Cadastrar', to: '/register' }] : []),
		...(!isAuthenticated ? [{ label: 'Entrar', to: '/login' }] : []),
	];

	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: 'poems', element: <PoemsPage /> },
				{ path: 'poets', element: <PoetsPage /> },
				{ path: 'poems/:slug/:id', element: <PoemPage /> },
				{ path: 'authors/:id', element: <AuthorPage /> },
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
				{
					path: 'notifications',
					element: <NotificationsPage />,
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}
