import {
	Badge,
	Box,
	HStack,
	VStack,
	Button,
	useDisclosure,
	Drawer,
	Icon,
	Flex,
	Link,
	Text,
} from '@chakra-ui/react';
import { Menu, X } from 'lucide-react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

/* ---------------- LOGO ---------------- */
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
					<Text
						textStyle='small'
						color='pink.100'
						fontWeight='700'
						lineHeight='short'
					>
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

/* ---------------- MENU LINKS ---------------- */
const MenuLinks = ({
	links,
	isMobile = false,
	isSidebar = false,
	onLinkClick,
}: {
	links: { label: string; to: string }[];
	isMobile?: boolean;
	isSidebar?: boolean;
	onLinkClick?: () => void;
}) => {
	const Container = isMobile || isSidebar ? VStack : HStack;

	return (
		<Container
			gap={isMobile || isSidebar ? 2 : 6}
			align={isSidebar ? 'stretch' : 'center'}
			w={isSidebar ? 'full' : undefined}
		>
			{links.map((link) => (
				<Link
					asChild
					color='pink.100'
					w={isSidebar || isMobile ? 'full' : 'auto'}
					px={3}
					py={2}
					borderRadius='md'
					textStyle='small'
					display='flex'
					justifyContent={isSidebar ? 'flex-start' : 'center'}
					key={link.label}
					onClick={onLinkClick}
					transition='all 0.2s ease'
					_hover={{ bg: 'rgba(255, 255, 255, 0.06)', color: 'pink.50' }}
					_currentPage={{
						fontWeight: 'bold',
						color: 'pink.50',
						bg: 'rgba(255, 143, 189, 0.14)',
					}}
				>
					<NavLink to={link.to}>{link.label}</NavLink>
				</Link>
			))}
		</Container>
	);
};

/* ---------------- MOBILE DRAWER ---------------- */
const MobileDrawer = ({
	links,
}: {
	links: { label: string; to: string }[];
}) => {
	const { open, onToggle } = useDisclosure();

	return (
		<Drawer.Root
			size='md'
			open={open}
			onOpenChange={onToggle}
			placement='end'
			aria-label='Menu Drawer'
			unmountOnExit
			closeOnEscape
			closeOnInteractOutside
			contained
			restoreFocus
			role='dialog'
		>
			<Drawer.Trigger asChild>
				<Button variant='plain' size='sm' color='pink.100'>
					<Icon as={Menu} size='2xl' />
				</Button>
			</Drawer.Trigger>

			<Drawer.Backdrop padding='0' />
			<Drawer.Positioner>
				<Drawer.Content
					bg='purple.900'
					borderLeft='1px solid'
					borderColor='border'
					maxW='280px'
					display='flex'
					flexDirection='column'
				>
					<Drawer.Header>
						<Drawer.Title>
							<Logo />
						</Drawer.Title>
						<Drawer.CloseTrigger asChild pos='initial'>
							<Button variant='plain' color='pink.100'>
								<Icon as={X} size='2xl' />
							</Button>
						</Drawer.CloseTrigger>
					</Drawer.Header>
					<Drawer.Body>
						<MenuLinks links={links} isMobile onLinkClick={onToggle} />
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Positioner>
		</Drawer.Root>
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
					<MenuLinks links={links} isSidebar />
				</Flex>

				<Text textStyle='small' color='pink.200' opacity={0.7}>
					Olapoesia
				</Text>
			</Flex>

			<Flex flex='1' minW={0} direction='column' w='full'>
				<Flex
					as='nav'
					display={{ base: 'flex', md: 'none' }}
					align='center'
					justify='space-between'
					w='full'
					px={4}
					py={3}
					borderBottom='1px solid'
					borderColor='border'
					bg='rgba(18, 0, 17, 0.9)'
					backdropFilter='blur(6px)'
					position='sticky'
					top={0}
					zIndex={10}
				>
					<Logo />

					{/* Mobile Drawer */}
					<Box display={{ base: 'block', md: 'none' }}>
						<MobileDrawer links={links} />
					</Box>
				</Flex>

				<Outlet />
			</Flex>
		</Flex>
	);
}
