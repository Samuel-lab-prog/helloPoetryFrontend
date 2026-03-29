import { Badge, Flex, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { getLinkIcon } from './navbarIcons';
import { Logo } from './Logo';
import type { NavbarLink } from './types';

type NavbarSidebarProps = {
	links: NavbarLink[];
	currentPath: string;
	unreadCount: number;
	onSameRouteClick: () => void;
};

export function NavbarSidebar({
	links,
	currentPath,
	unreadCount,
	onSameRouteClick,
}: NavbarSidebarProps) {
	return (
		<Flex
			as='aside'
			display={{ base: 'none', lg: 'flex' }}
			direction='column'
			justify='space-between'
			w='320px'
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
				<VStack gap={2} align='stretch' w='full'>
					{links.map((link) => (
						<Link asChild variant='nav' size='sm' key={link.label}>
							<NavLink
								to={link.to}
								onClick={() => {
									if (currentPath === link.to) {
										onSameRouteClick();
									}
								}}
							>
								<HStack gap={2} justify='space-between' w='full'>
									<HStack gap={2}>
										<Icon as={getLinkIcon(link.to)} boxSize={4} />
										<Text>{link.label}</Text>
									</HStack>
									{link.to === '/notifications' && unreadCount > 0 && (
										<Badge size='sm' colorPalette='pink' variant='solid'>
											{unreadCount > 99 ? '99+' : unreadCount}
										</Badge>
									)}
								</HStack>
							</NavLink>
						</Link>
					))}
				</VStack>
			</Flex>

			<Text textStyle='small' color='pink.200' opacity={0.7}>
				Olapoesia
			</Text>
		</Flex>
	);
}
