import { friends, notifications, poems, users } from '@Api';
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
		<Flex as='main' layerStyle='mainPadded' minH='40vh' align='center' justify='center'>
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

const loadHomePage = () => import('./features/feed/use-cases/home/Page');
const loadPoemPage = () => import('./features/poems/use-cases/poem/Page');
const loadPoemImmersivePage = () => import('./features/poems/use-cases/poem-immersive/Page');
const loadCreatePoemPage = () => import('./features/poems/use-cases/create-poem/Page');
const loadAdminPage = () => import('./features/poems/use-cases/admin/Page');
const loadPoemModerationPage = () => import('./features/moderation/use-cases/poem-moderation/Page');
const loadLoginPage = () => import('./features/auth/use-cases/login/Page');
const loadRegisterPage = () => import('./features/users/use-cases/register/Page');
const loadPoetsPage = () => import('./features/users/use-cases/poets-search/Page');
const loadAuthorPage = () => import('./features/users/use-cases/author/Page');
const loadMyProfilePage = () => import('./features/users/use-cases/my-profile/Page');
const loadMyProfileCollectionsPage = () =>
	import('./features/users/use-cases/my-profile-collections/Page');
const loadMyProfileFriendRequestsPage = () =>
	import('./features/users/use-cases/my-profile-friend-requests/Page');
const loadMyProfilePoemsPage = () => import('./features/users/use-cases/my-profile-poems/Page');
const loadMyProfileSavedPoemsPage = () =>
	import('./features/users/use-cases/my-profile-saved-poems/Page');
const loadNotificationsPage = () => import('./features/notifications/use-cases/notifications/Page');

const HomePage = lazyPage(loadHomePage, (module) => module.HomePage);
const PoemPage = lazyPage(loadPoemPage, (module) => module.PoemPage);
const PoemImmersivePage = lazyPage(loadPoemImmersivePage, (module) => module.PoemImmersivePage);
const CreatePoemPage = lazyPage(loadCreatePoemPage, (module) => module.CreatePoemPage);
const AdminPage = lazyPage(loadAdminPage, (module) => module.AdminPage);
const PoemModerationPage = lazyPage(loadPoemModerationPage, (module) => module.PoemModerationPage);
const LoginPage = lazyPage(loadLoginPage, (module) => module.LoginPage);
const RegisterPage = lazyPage(loadRegisterPage, (module) => module.RegisterPage);
const PoetsPage = lazyPage(loadPoetsPage, (module) => module.PoetsPage);
const AuthorPage = lazyPage(loadAuthorPage, (module) => module.AuthorPage);
const MyProfilePage = lazyPage(loadMyProfilePage, (module) => module.MyProfilePage);
const MyProfileCollectionsPage = lazyPage(
	loadMyProfileCollectionsPage,
	(module) => module.MyProfileCollectionsPage,
);
const MyProfileFriendRequestsPage = lazyPage(
	loadMyProfileFriendRequestsPage,
	(module) => module.MyProfileFriendRequestsPage,
);
const MyProfilePoemsPage = lazyPage(loadMyProfilePoemsPage, (module) => module.MyProfilePoemsPage);
const MyProfileSavedPoemsPage = lazyPage(
	loadMyProfileSavedPoemsPage,
	(module) => module.MyProfileSavedPoemsPage,
);
const NotificationsPage = lazyPage(loadNotificationsPage, (module) => module.NotificationsPage);

const prefetchedRoutes = new Set<string>();
const PREFETCH_NOTIFICATIONS_LIMIT = 50;
const PREFETCH_POETS_LIMIT = 10;

function schedulePrefetch(work: () => void) {
	if (typeof window === 'undefined') return;
	if ('requestIdleCallback' in window) window.requestIdleCallback(() => work());
	else setTimeout(work, 0);
}

function prefetchChunkForRoute(to: string) {
	if (to === '/') return loadHomePage();
	if (to === '/poets') return loadPoetsPage();
	if (to === '/poems/new') return loadCreatePoemPage();
	if (to === '/login') return loadLoginPage();
	if (to === '/register') return loadRegisterPage();
	if (to === '/notifications') return loadNotificationsPage();
	if (to === '/my-profile') return loadMyProfilePage();
	if (to === '/my-profile/collections') return loadMyProfileCollectionsPage();
	if (to === '/my-profile/friend-requests') return loadMyProfileFriendRequestsPage();
	if (to === '/my-profile/poems') return loadMyProfilePoemsPage();
	if (to === '/my-profile/saved-poems') return loadMyProfileSavedPoemsPage();
	if (to === '/admin') return loadAdminPage();
	if (to === '/admin/moderation') return loadPoemModerationPage();
	if (to.startsWith('/authors/')) return loadAuthorPage();
	if (to.startsWith('/poems/') && to.includes('/immersive')) return loadPoemImmersivePage();
	if (to.startsWith('/poems/')) return loadPoemPage();
	return Promise.resolve();
}

function prefetchDataForRoute(to: string, userId?: number) {
	if (to === '/poets') {
		void users.getPublicUsers.prefetch({
			limit: PREFETCH_POETS_LIMIT,
			searchNickname: undefined,
		});
		return;
	}

	if (!userId) return;

	if (to === '/notifications') {
		void notifications.getNotifications.prefetch({
			onlyUnread: false,
			limit: PREFETCH_NOTIFICATIONS_LIMIT,
		});
		return;
	}

	if (to.startsWith('/my-profile')) {
		void users.getProfile.prefetch(String(userId));
		void poems.getMyPoems.prefetch();
		void poems.getSavedPoems.prefetch();
		void poems.getCollections.prefetch();
		void friends.getMyFriendRequests.prefetch();
	}
}

function createRoutePrefetcher(userId?: number) {
	return (to: string) => {
		const cacheKey = `${to}:${userId ?? 'guest'}`;
		if (prefetchedRoutes.has(cacheKey)) return;
		prefetchedRoutes.add(cacheKey);

		schedulePrefetch(() => {
			void prefetchChunkForRoute(to);
			prefetchDataForRoute(to, userId);
		});
	};
}

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
	const prefetchRoute = createRoutePrefetcher(authClient?.id);

	return <Navbar links={navLinks} onPrefetchRoute={prefetchRoute} />;
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
