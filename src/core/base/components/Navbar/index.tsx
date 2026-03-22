import { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { NavbarBottomNav } from './NavbarBottomNav';
import { NavbarSidebar } from './NavbarSidebar';
import type { NavbarLink } from './types';

type NavbarProps = {
	links: NavbarLink[];
};

export function Navbar({ links }: NavbarProps) {
	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);
	const location = useLocation();
	const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [location.pathname]);

	return (
		<Flex minH='100vh' w='full'>
			<NavbarSidebar
				links={links}
				currentPath={location.pathname}
				unreadCount={unreadCount}
				onSameRouteClick={scrollToTop}
			/>

			<Flex flex='1' minW={0} direction='column' w='full' pb={{ base: '84px', lg: 0 }}>
				<Outlet />
			</Flex>

			<NavbarBottomNav
				links={links}
				currentPath={location.pathname}
				unreadCount={unreadCount}
				onSameRouteClick={scrollToTop}
			/>
		</Flex>
	);
}

export type { NavbarLink };
