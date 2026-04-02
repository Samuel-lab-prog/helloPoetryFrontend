import { useEffect, useRef } from 'react';
import { Avatar, Badge, Flex, Icon, Link, Text } from '@chakra-ui/react';
import { Bell, LogIn, PenSquare, UserPlus } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { useMyProfile } from '@root/features/users/hooks/useMyProfile';
import { NavbarBottomNav } from './BottomNav';
import { Logo } from './Logo';
import { NavbarSidebar } from './Sidebar';
import type { NavbarLink } from './utils';

type NavbarProps = {
	links: NavbarLink[];
};

export function Navbar({ links }: NavbarProps) {
	const authClient = useAuthClientStore((state) => state.authClient);
	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);
	const { profile } = useMyProfile();
	const location = useLocation();
	const contentRef = useRef<HTMLDivElement | null>(null);
	const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
	const isAuthenticated = Boolean(authClient);

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
		contentRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
	}, [location.pathname]);

	return (
		<Flex h='100vh' w='full' direction='column' overflow='hidden'>
			<Flex
				as='header'
				w='full'
				h='72px'
				px={{ base: 4, md: 8 }}
				py={3}
				borderBottom='1px solid'
				borderColor='border'
				bg='rgba(18, 0, 17, 0.9)'
				backdropFilter='blur(6px)'
				position='sticky'
				top={0}
				zIndex={10}
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
									<NavLink to='/poems/new' aria-label='Criar poema'>
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
									<NavLink to='/notifications' aria-label='Notificações'>
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
									<NavLink to='/my-profile' aria-label='Perfil'>
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
									<NavLink to='/login' aria-label='Entrar'>
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
									<NavLink to='/register' aria-label='Criar conta'>
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
				/>

				<Flex
					flex='1'
					minW={0}
					direction='column'
					w='full'
					pb={{ base: '84px', lg: 0 }}
					overflowY='auto'
					ref={contentRef}
				>
					<Outlet />
				</Flex>

				<NavbarBottomNav
					links={links}
					currentPath={location.pathname}
					unreadCount={unreadCount}
					onSameRouteClick={scrollToTop}
				/>
			</Flex>
		</Flex>
	);
}

export type { NavbarLink };
