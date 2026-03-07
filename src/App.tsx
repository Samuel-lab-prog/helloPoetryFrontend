import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Navbar, ErrorPage } from '@features/base';
import { AuthorPage, PoemPage, PoemsPage, HomePage } from '@features/poems';
import {
	LoginPage,
	MyProfilePage,
	NotificationsPage,
	RegisterPage,
} from '@features/auth';
import { AdminPage, CreatePoemPage } from '@features/admin';

export default function App() {
	const isAuthenticated = !!localStorage.getItem('auth-client');

	const navLinks = [
		{ to: '/', label: 'Início' },
		{ to: '/poems', label: 'Poemas' },
		...(isAuthenticated ? [{ to: '/poems/new', label: 'Criar Poema' }] : []),
		...(isAuthenticated ? [{ to: '/my-profile', label: 'Meu Perfil' }] : []),
		...(isAuthenticated
			? [{ to: '/notifications', label: 'Notificações' }]
			: []),
		{ label: 'Cadastrar', to: '/register' },
		{ label: 'Entrar', to: '/login' },
	];

	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: 'poems', element: <PoemsPage /> },
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
