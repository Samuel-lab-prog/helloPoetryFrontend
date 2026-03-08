/* eslint-disable arrow-body-style */
import { Badge, Box, Flex, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { Bell, BookOpen, House, LogIn, PenSquare, User, UserPlus, Users } from 'lucide-react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

function getLinkIcon(to: string) {
	switch (to) {
		case '/':
			return House;
		case '/poems':
			return BookOpen;
		case '/poets':
			return Users;
		case '/poems/new':
			return PenSquare;
		case '/my-profile':
			return User;
		case '/notifications':
			return Bell;
		case '/register':
			return UserPlus;
		case '/login':
			return LogIn;
		default:
			return BookOpen;
	}
}

function Logo() {
	const navigate = useNavigate();

	return (
		<Box
			onClick={() => navigate('/')}
			cursor='pointer'
			transition='opacity 0.2s ease'
			_hover={{ opacity: 0.8 }}
		>
			<HStack gap={3}>
				<Box
					w='40px'
					h='40px'
					display='grid'
					placeItems='center'
					borderRadius='full'
					bg='linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})'
					color='white'
					fontWeight='700'
					fontSize='xs'
				>
					OP
				</Box>
				<VStack align='start' gap={0}>
					<Text textStyle='small' color='pink.100' fontWeight='700' lineHeight='short'>
						Olapoesia
					</Text>
					<Badge size='sm' colorPalette='pink' variant='subtle'>
						Poemas
					</Badge>
				</VStack>
			</HStack>
		</Box>
	);
}

const SidebarLinks = ({ links }: { links: { label: string; to: string }[] }) => {
	return (
		<VStack gap={2} align='stretch' w='full'>
			{links.map((link) => (
				<Link asChild variant='nav' size='sm' key={link.label}>
					<NavLink to={link.to}>
						<HStack gap={2}>
							<Icon as={getLinkIcon(link.to)} boxSize={4} />
							<Text>{link.label}</Text>
						</HStack>
					</NavLink>
				</Link>
			))}
		</VStack>
	);
};

const BottomMobileNav = ({ links }: { links: { label: string; to: string }[] }) => {
	return (
		<Box
			as='nav'
			display={{ base: 'block', md: 'none' }}
			position='fixed'
			left={0}
			right={0}
			bottom={0}
			zIndex={20}
			borderTop='1px solid'
			borderColor='border'
			bg='rgba(18, 0, 17, 0.95)'
			backdropFilter='blur(8px)'
			pb='calc(env(safe-area-inset-bottom, 0px))'
		>
			<HStack px={2} py={2} gap={1} overflowX='auto' scrollbar='hidden' justify='center'>
				{links.map((link) => (
					<Link key={link.label} asChild variant='navIcon' size='sm'>
						<NavLink to={link.to} style={{ display: 'block' }}>
							<Flex direction='column' align='center' justifyContent='center' gap={0}>
								<Icon as={getLinkIcon(link.to)} boxSize={4.5} strokeWidth={2.2} />
							</Flex>
						</NavLink>
					</Link>
				))}
			</HStack>
		</Box>
	);
};

export function Navbar({ links }: { links: { label: string; to: string }[] }) {
	return (
		<Flex minH='100vh' w='full'>
			<Flex
				as='aside'
				display={{ base: 'none', md: 'flex' }}
				direction='column'
				justify='space-between'
				w='260px'
				minH='100vh'
				position='sticky'
				top={0}
				alignSelf='flex-start'
				p={6}
				borderRight='1px solid'
				borderColor='border'
				bg='rgba(18, 0, 17, 0.86)'
				backdropFilter='blur(6px)'
			>
				<Flex direction='column' gap={8}>
					<Logo />
					<SidebarLinks links={links} />
				</Flex>

				<Text textStyle='small' color='pink.200' opacity={0.7}>
					Olapoesia
				</Text>
			</Flex>

			<Flex flex='1' minW={0} direction='column' w='full' pb={{ base: '84px', md: 0 }}>
				<Outlet />
			</Flex>

			<BottomMobileNav links={links} />
		</Flex>
	);
}
