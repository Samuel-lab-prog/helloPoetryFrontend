import { lazy, Suspense, type ComponentType } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { ErrorPage, Navbar, Toaster } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';

function lazyPage<TModule extends object>(
	load: () => Promise<TModule>,
	select: (module: TModule) => ComponentType,
) {
	return lazy(async () => ({ default: select(await load()) }));
}

function PageLoader() {
	return (
		<Flex as='main' layerStyle='main' minH='40vh' align='center' justify='center'>
			<Spinner size='lg' color='pink.300' />
		</Flex>
	);
}

function renderLazyPage(Component: ComponentType) {
	return (
		<Suspense fallback={<PageLoader />}>
			<Component />
		</Suspense>
	);
}

const HomePage = lazyPage(
	() => import('./features/poems/use-cases/home/Page'),
	(module) => module.HomePage,
);
const PoemsPage = lazyPage(
	() => import('./features/poems/use-cases/poems/Page'),
	(module) => module.PoemsPage,
);
const PoemPage = lazyPage(
	() => import('./features/poems/use-cases/poem/Page'),
	(module) => module.PoemPage,
);
const PoemImmersivePage = lazyPage(
	() => import('./features/poems/use-cases/poem/ImmersivePage'),
	(module) => module.PoemImmersivePage,
);
const CreatePoemPage = lazyPage(
	() => import('./features/poems/use-cases/create-poem/Page'),
	(module) => module.CreatePoemPage,
);
const AdminPage = lazyPage(
	() => import('./features/poems/use-cases/admin/Page'),
	(module) => module.AdminPage,
);
const PoemModerationPage = lazyPage(
	() => import('./features/moderation/Pages/PoemModeration/Page'),
	(module) => module.PoemModerationPage,
);
const LoginPage = lazyPage(
	() => import('./features/auth/use-cases/login/Page'),
	(module) => module.LoginPage,
);
const RegisterPage = lazyPage(
	() => import('./features/auth/use-cases/register/Page'),
	(module) => module.RegisterPage,
);
const PoetsPage = lazyPage(
	() => import('./features/users/pages/PoetsPage'),
	(module) => module.PoetsPage,
);
const AuthorPage = lazyPage(
	() => import('./features/users/pages/AuthorPage'),
	(module) => module.AuthorPage,
);
const MyProfilePage = lazyPage(
	() => import('./features/users/pages/MyProfilePage'),
	(module) => module.MyProfilePage,
);
const MyProfileCollectionsPage = lazyPage(
	() => import('./features/users/pages/MyProfileCollectionsPage'),
	(module) => module.MyProfileCollectionsPage,
);
const MyProfileFriendRequestsPage = lazyPage(
	() => import('./features/users/pages/MyProfileFriendRequestsPage'),
	(module) => module.MyProfileFriendRequestsPage,
);
const MyProfilePoemsPage = lazyPage(
	() => import('./features/users/pages/MyProfilePoemsPage'),
	(module) => module.MyProfilePoemsPage,
);
const MyProfileSavedPoemsPage = lazyPage(
	() => import('./features/users/pages/MyProfileSavedPoemsPage'),
	(module) => module.MyProfileSavedPoemsPage,
);
const NotificationsPage = lazyPage(
	() => import('./features/users/pages/NotificationsPage'),
	(module) => module.NotificationsPage,
);

function generateNavLinks(isAuthenticated: boolean, role?: string) {
	const links = [
		{ to: '/', label: 'Inicio' },
		{ to: '/poems', label: 'Poemas' },
		{ to: '/poets', label: 'Poetas' },
	];
	if (isAuthenticated) {
		links.push({ to: '/poems/new', label: 'Criar' });
		links.push({ to: '/my-profile', label: 'Meu Perfil' });
		links.push({ to: '/notifications', label: 'Notificacoes' });
		if (role === 'moderator' || role === 'admin') {
			links.push({ to: '/admin/moderation', label: 'Moderacao' });
		}
	} else {
		links.push({ to: '/register', label: 'Cadastrar' });
		links.push({ to: '/login', label: 'Entrar' });
	}
	return links;
}

export default function App() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const isAuthenticated = Boolean(authClient);
	const navLinks = generateNavLinks(isAuthenticated, authClient?.role);

	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: renderLazyPage(HomePage) },
				{ path: 'poems', element: renderLazyPage(PoemsPage) },
				{ path: 'poets', element: renderLazyPage(PoetsPage) },
				{ path: 'poems/:id', element: renderLazyPage(PoemPage) },
				{ path: 'poems/:slug/:id', element: renderLazyPage(PoemPage) },
				{ path: 'poems/:id/immersive', element: renderLazyPage(PoemImmersivePage) },
				{ path: 'poems/:slug/:id/immersive', element: renderLazyPage(PoemImmersivePage) },
				{ path: 'authors/:id', element: renderLazyPage(AuthorPage) },
				{ path: '/login', element: renderLazyPage(LoginPage) },
				{ path: '/register', element: renderLazyPage(RegisterPage) },
				{ path: 'poems/new', element: renderLazyPage(CreatePoemPage) },
				{ path: 'admin', element: renderLazyPage(AdminPage) },
				{ path: 'admin/moderation', element: renderLazyPage(PoemModerationPage) },
				{ path: 'my-profile', element: renderLazyPage(MyProfilePage) },
				{ path: 'my-profile/collections', element: renderLazyPage(MyProfileCollectionsPage) },
				{
					path: 'my-profile/friend-requests',
					element: renderLazyPage(MyProfileFriendRequestsPage),
				},
				{ path: 'my-profile/poems', element: renderLazyPage(MyProfilePoemsPage) },
				{ path: 'my-profile/saved-poems', element: renderLazyPage(MyProfileSavedPoemsPage) },
				{ path: 'notifications', element: renderLazyPage(NotificationsPage) },
			],
		},
	]);

	return (
		<>
			<RouterProvider router={router} />
			<Toaster />
		</>
	);
}
