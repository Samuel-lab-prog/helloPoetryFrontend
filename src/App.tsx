import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Navbar, ErrorPage } from '@features/base';
import { PostPage, PostsPage, HomePage } from '@features/posts';
import { LoginPage } from '@features/auth';
import { AdminPage, ProtectedRoutePage } from '@features/admin';

const navLinks = [
	{ to: '/', label: 'Home' },
	{ to: '/posts', label: 'Posts' },
];

export default function App() {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <Navbar links={navLinks} />,
			errorElement: <ErrorPage />,
			children: [
				{ index: true, element: <HomePage /> },
				{ path: 'posts', element: <PostsPage /> },
				{ path: 'posts/:slug/:id', element: <PostPage /> },
				{ path: '/login', element: <LoginPage /> },
				{
					path: 'admin',
					element: <ProtectedRoutePage />,
					children: [
						{
							index: true,
							element: <AdminPage />,
						},
					],
				},
			],
		},
	]);

	return <RouterProvider router={router} />;
}
