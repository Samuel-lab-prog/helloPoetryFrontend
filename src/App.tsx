import { Navbar, Toaster } from '@BaseComponents';
import { ErrorPage } from '@BasePages';
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { type ComponentType, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
	() => import('./features/feed/use-cases/home/Page'),
	(module) => module.HomePage,
);
const PoemPage = lazyPage(
	() => import('./features/poems/use-cases/poem/Page'),
	(module) => module.PoemPage,
);
const PoemImmersivePage = lazyPage(
	() => import('./features/poems/use-cases/poem-immersive/Page'),
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
	() => import('./features/moderation/use-cases/poem-moderation/Page'),
	(module) => module.PoemModerationPage,
);
const LoginPage = lazyPage(
	() => import('./features/auth/use-cases/login/Page'),
	(module) => module.LoginPage,
);
const RegisterPage = lazyPage(
	() => import('./features/users/use-cases/register/Page'),
	(module) => module.RegisterPage,
);
const PoetsPage = lazyPage(
	() => import('./features/users/use-cases/poets-search/Page'),
	(module) => module.PoetsPage,
);
const AuthorPage = lazyPage(
	() => import('./features/users/use-cases/author/Page'),
	(module) => module.AuthorPage,
);
const MyProfilePage = lazyPage(
	() => import('./features/users/use-cases/my-profile/Page'),
	(module) => module.MyProfilePage,
);
const MyProfileCollectionsPage = lazyPage(
	() => import('./features/users/use-cases/my-profile-collections/Page'),
	(module) => module.MyProfileCollectionsPage,
);
const MyProfileFriendRequestsPage = lazyPage(
	() => import('./features/users/use-cases/my-profile-friend-requests/Page'),
	(module) => module.MyProfileFriendRequestsPage,
);
const MyProfilePoemsPage = lazyPage(
	() => import('./features/users/use-cases/my-profile-poems/Page'),
	(module) => module.MyProfilePoemsPage,
);
const MyProfileSavedPoemsPage = lazyPage(
	() => import('./features/users/use-cases/my-profile-saved-poems/Page'),
	(module) => module.MyProfileSavedPoemsPage,
);
const NotificationsPage = lazyPage(
	() => import('./features/notifications/use-cases/notifications/Page'),
	(module) => module.NotificationsPage,
);

function generateNavLinks(isAuthenticated: boolean, role?: string) {
	const links = [
		{ to: '/', label: 'Home' },
		{ to: '/poets', label: 'Poets' },
	];
	if (isAuthenticated) {
		links.push({ to: '/poems/new', label: 'Create' });
		links.push({ to: '/my-profile', label: 'My Profile' });
		links.push({ to: '/notifications', label: 'Notifications' });
		if (role === 'moderator' || role === 'admin') {
			links.push({ to: '/admin/moderation', label: 'Moderation' });
		}
	} else {
		links.push({ to: '/register', label: 'Sign up' });
		links.push({ to: '/login', label: 'Sign in' });
	}
	return links;
}

function AppLayout() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const isAuthenticated = Boolean(authClient);
	const navLinks = generateNavLinks(isAuthenticated, authClient?.role);

	return <Navbar links={navLinks} />;
}

const router = createBrowserRouter([
	{
		path: '/',
		element: <AppLayout />,
		errorElement: <ErrorPage />,
		children: [
			{ index: true, element: renderLazyPage(HomePage) },
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

export default function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster />
		</>
	);
}
