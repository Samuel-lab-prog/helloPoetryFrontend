import { Avatar, Badge, Flex, Icon, Link, Text, useBreakpointValue } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useMyProfile } from '@features/users/public/hooks/useMyProfile';
import { Bell, LogIn, PenSquare, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { NavbarBottomNav } from './BottomNav';
import { Logo } from './Logo';
import { NavbarSidebar } from './Sidebar';
import type { NavbarLink } from './utils';

type NavbarProps = {
	links: NavbarLink[];
	onPrefetchRoute?: (to: string) => void;
};

export function Navbar({ links, onPrefetchRoute }: NavbarProps) {
	const authClient = useAuthClientStore((state) => state.authClient);
	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);
	const { profile } = useMyProfile();
	const location = useLocation();
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [navHidden, setNavHidden] = useState(false);
	const lastScrollRef = useRef({ top: 0, time: 0 });
	const rafRef = useRef<number | null>(null);
	const lastToggleRef = useRef(0);
	const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
	const shouldHideNav = isMobile && navHidden;
	const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	const isAuthenticated = Boolean(authClient);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
		contentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [location.pathname]);

	useEffect(() => {
		const target = contentRef.current;
		if (!target) return;

		const onScroll = () => {
			if (!isMobile) {
				if (navHidden) setNavHidden(false);
				return;
			}
			if (rafRef.current !== null) return;
			rafRef.current = window.requestAnimationFrame(() => {
				rafRef.current = null;
				const top = target.scrollTop;
				const now = performance.now();
				const last = lastScrollRef.current;
				const dt = Math.max(1, now - last.time);
				const dy = top - last.top;
				const velocity = (dy / dt) * 1000;
				const nowToggle = performance.now();
				const canToggle = nowToggle - lastToggleRef.current > 180;

				lastScrollRef.current = { top, time: now };

				if (top <= 24) {
					setNavHidden(false);
					return;
				}

				if (dy > 0 && canToggle && (velocity > 900 || dy > 120)) {
					lastToggleRef.current = nowToggle;
					setNavHidden(true);
					return;
				}

				if (dy < 0 && canToggle && (velocity < -500 || dy < -60)) {
					lastToggleRef.current = nowToggle;
					setNavHidden(false);
				}
			});
		};

		lastScrollRef.current = { top: target.scrollTop, time: performance.now() };
		target.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			target.removeEventListener('scroll', onScroll);
			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [isMobile, navHidden]);

	useEffect(() => {
		if (!isMobile && navHidden) setNavHidden(false);
	}, [isMobile, navHidden]);

	return (
		<Flex h='100vh' w='full' direction='column' overflow='hidden'>
			<Flex
				as='header'
				w='full'
				h={shouldHideNav ? '0px' : '72px'}
				px={{ base: 4, md: 8 }}
				py={shouldHideNav ? 0 : 3}
				borderBottom={shouldHideNav ? '0' : '1px solid'}
				borderColor='border'
				bg='rgba(18, 0, 17, 0.9)'
				backdropFilter='blur(6px)'
				position='sticky'
				top={0}
				zIndex={10}
				transition='all 0.2s ease'
				transform={shouldHideNav ? 'translateY(-100%)' : 'translateY(0)'}
				opacity={shouldHideNav ? 0 : 1}
				overflow='hidden'
			>
				<Flex align='center' gap={6} w='full'>
					<Logo />
					<Flex align='center' gap={3} ml='auto'>
						{isAuthenticated ? (
							<>
								<Link
									asChild
									display='inline-flex'
									alignItems='center'
									justifyContent='center'
									h={{ base: 8, md: 9 }}
									px={{ base: 2.5, md: 3 }}
									gap={2}
									borderRadius='full'
									border='1px solid'
									borderColor='purple.500'
									color='pink.100'
									_hover={{
										color: 'pink.50',
										borderColor: 'pink.400',
										bg: 'rgba(255, 255, 255, 0.06)',
									}}
								>
									<NavLink
										to='/poems/new'
										aria-label='Criar poema'
										onMouseEnter={() => onPrefetchRoute?.('/poems/new')}
										onFocus={() => onPrefetchRoute?.('/poems/new')}
									>
										<Icon as={PenSquare} boxSize={{ base: 3.5, md: 4 }} />
										<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight='medium'>
											Create
										</Text>
									</NavLink>
								</Link>
								<Link
									asChild
									display={{ base: 'none', lg: 'inline-flex' }}
									alignItems='center'
									justifyContent='center'
									position='relative'
									h={9}
									w={9}
									borderRadius='full'
									border='1px solid'
									borderColor='purple.500'
									color='pink.100'
									_hover={{
										color: 'pink.50',
										borderColor: 'pink.400',
										bg: 'rgba(255, 255, 255, 0.06)',
									}}
								>
									<NavLink
										to='/notifications'
										aria-label='Notificações'
										onMouseEnter={() => onPrefetchRoute?.('/notifications')}
										onFocus={() => onPrefetchRoute?.('/notifications')}
									>
										<Icon as={Bell} boxSize={4.5} strokeWidth={2.2} />
										{unreadCount > 0 && (
											<Badge
												position='absolute'
												top='-1'
												right='-1'
												minW='1.2rem'
												h='1.2rem'
												px='1'
												display='inline-flex'
												alignItems='center'
												justifyContent='center'
												borderRadius='full'
												colorPalette='pink'
												variant='solid'
												fontSize='2xs'
											>
												{unreadCount > 9 ? '9+' : unreadCount}
											</Badge>
										)}
									</NavLink>
								</Link>
								<Link asChild>
									<NavLink
										to='/my-profile'
										aria-label='Perfil'
										onMouseEnter={() => onPrefetchRoute?.('/my-profile')}
										onFocus={() => onPrefetchRoute?.('/my-profile')}
									>
										<Avatar.Root
											size='sm'
											bg='purple.700'
											color='pink.50'
											border='1px solid'
											borderColor='purple.500'
										>
											<Avatar.Image src={profile?.avatarUrl ?? undefined} />
											<Avatar.Fallback name={profile?.name ?? profile?.nickname ?? 'Perfil'} />
										</Avatar.Root>
									</NavLink>
								</Link>
							</>
						) : (
							<>
								<Link
									asChild
									display='inline-flex'
									alignItems='center'
									justifyContent='center'
									h={{ base: 8, md: 9 }}
									px={{ base: 2.5, md: 3 }}
									gap={2}
									borderRadius='full'
									border='1px solid'
									borderColor='purple.500'
									color='pink.100'
									_hover={{
										color: 'pink.50',
										borderColor: 'pink.400',
										bg: 'rgba(255, 255, 255, 0.06)',
									}}
								>
									<NavLink
										to='/login'
										aria-label='Entrar'
										onMouseEnter={() => onPrefetchRoute?.('/login')}
										onFocus={() => onPrefetchRoute?.('/login')}
									>
										<Icon as={LogIn} boxSize={{ base: 3.5, md: 4 }} />
										<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight='medium'>
											Sign in
										</Text>
									</NavLink>
								</Link>
								<Link
									asChild
									display='inline-flex'
									alignItems='center'
									justifyContent='center'
									h={{ base: 8, md: 9 }}
									px={{ base: 2.5, md: 3 }}
									gap={2}
									borderRadius='full'
									border='1px solid'
									borderColor='pink.400'
									color='pink.50'
									bg='rgba(255, 143, 189, 0.14)'
									_hover={{
										color: 'pink.50',
										borderColor: 'pink.300',
										bg: 'rgba(255, 143, 189, 0.22)',
									}}
								>
									<NavLink
										to='/register'
										aria-label='Criar conta'
										onMouseEnter={() => onPrefetchRoute?.('/register')}
										onFocus={() => onPrefetchRoute?.('/register')}
									>
										<Icon as={UserPlus} boxSize={{ base: 3.5, md: 4 }} />
										<Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight='medium'>
											Sign up
										</Text>
									</NavLink>
								</Link>
							</>
						)}
					</Flex>
				</Flex>
			</Flex>

			<Flex flex='1' minH={0} w='full' overflow='hidden'>
				<NavbarSidebar
					links={links}
					currentPath={location.pathname}
					onSameRouteClick={scrollToTop}
					onPrefetchRoute={onPrefetchRoute}
				/>

				<Flex
					flex='1'
					minW={0}
					direction='column'
					w='full'
					pb={{ base: '84px', lg: 0 }}
					overflowY='auto'
					scrollbarGutter='stable'
					ref={contentRef}
				>
					<Flex w='full' maxW='2xl' mx='auto' direction='column' minH='full'>
						<Outlet />
					</Flex>
				</Flex>

				<NavbarBottomNav
					links={links}
					currentPath={location.pathname}
					unreadCount={unreadCount}
					onSameRouteClick={scrollToTop}
					onPrefetchRoute={onPrefetchRoute}
					isHidden={shouldHideNav}
				/>
			</Flex>
		</Flex>
	);
}

export type { NavbarLink };
