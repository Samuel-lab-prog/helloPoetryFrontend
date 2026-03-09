import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Navbar, ErrorPage } from '@features/base';
import { HomePage, PoemPage, PoemsPage } from '@features/poems';
import { LoginPage, RegisterPage } from '@features/auth';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';

import {
	AuthorPage,
	MyProfileCollectionsPage,
	MyProfileFriendRequestsPage,
	MyProfilePage,
	MyProfilePoemsPage,
	MyProfileSavedPoemsPage,
	NotificationsPage,
	PoetsPage,
} from '@features/users';

import { AdminPage, CreatePoemPage } from '@features/admin';

function generateNavLinks(isAuthenticated: boolean) {
	const links = [
		{ to: '/', label: 'Início' },
		{ to: '/poems', label: 'Poemas' },
		{ to: '/poets', label: 'Poetas' },
	];
	if (isAuthenticated) {
		links.push({ to: '/poems/new', label: 'Criar' });
		links.push({ to: '/my-profile', label: 'Meu Perfil' });
		links.push({ to: '/notifications', label: 'Notificações' });
	} else {
		links.push({ to: '/register', label: 'Cadastrar' });
		links.push({ to: '/login', label: 'Entrar' });
	}
	return links;
}

export default function App() {
	const isAuthenticated = useAuthClientStore((state) => Boolean(state.authClient));
	const navLinks = generateNavLinks(isAuthenticated);

	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: 'poems', element: <PoemsPage /> },
				{ path: 'poets', element: <PoetsPage /> },
				{ path: 'poems/:id', element: <PoemPage /> },
				{ path: 'poems/:slug/:id', element: <PoemPage /> },
				{ path: 'authors/:id', element: <AuthorPage /> },
				{ path: '/login', element: <LoginPage /> },
				{ path: '/register', element: <RegisterPage /> },
				{ path: 'poems/new', element: <CreatePoemPage /> },
				{ path: 'admin', element: <AdminPage /> },
				{ path: 'my-profile', element: <MyProfilePage /> },
				{ path: 'my-profile/collections', element: <MyProfileCollectionsPage /> },
				{ path: 'my-profile/friend-requests', element: <MyProfileFriendRequestsPage /> },
				{ path: 'my-profile/poems', element: <MyProfilePoemsPage /> },
				{ path: 'my-profile/saved-poems', element: <MyProfileSavedPoemsPage /> },
				{ path: 'notifications', element: <NotificationsPage /> },
			],
		},
	]);

	return <RouterProvider router={router} />;
}
