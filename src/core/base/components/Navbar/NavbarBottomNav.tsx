import { Badge, Box, Flex, HStack, Icon, Link } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { getLinkIcon } from './navbarIcons';
import type { NavbarLink } from './types';

type NavbarBottomNavProps = {
	links: NavbarLink[];
	currentPath: string;
	unreadCount: number;
	onSameRouteClick: () => void;
};

export function NavbarBottomNav({
	links,
	currentPath,
	unreadCount,
	onSameRouteClick,
}: NavbarBottomNavProps) {
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
						<NavLink
							to={link.to}
							style={{ display: 'block' }}
							onClick={() => {
								if (currentPath === link.to) {
									onSameRouteClick();
								}
							}}
						>
							<Flex
								direction='column'
								align='center'
								justifyContent='center'
								gap={0}
								position='relative'
							>
								<Icon as={getLinkIcon(link.to)} boxSize={4.5} strokeWidth={2.2} />
								{link.to === '/notifications' && unreadCount > 0 && (
									<Badge
										position='absolute'
										top='-2'
										right='-2'
										minW='1.1rem'
										h='1.1rem'
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
							</Flex>
						</NavLink>
					</Link>
				))}
			</HStack>
		</Box>
	);
}
