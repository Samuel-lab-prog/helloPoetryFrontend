import { Flex, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { getLinkIcon, type NavbarLink } from './utils';

type NavbarSidebarProps = {
	links: NavbarLink[];
	currentPath: string;
	onSameRouteClick: () => void;
};

export function NavbarSidebar({ links, currentPath, onSameRouteClick }: NavbarSidebarProps) {
	return (
		<Flex
			as='aside'
			display={{ base: 'none', lg: 'flex' }}
			direction='column'
			justify='space-between'
			w='320px'
			h='full'
			alignSelf='flex-start'
			p={6}
			borderRight='1px solid'
			borderColor='border'
			overflowY='auto'
			bg='rgba(18, 0, 17, 0.86)'
			backdropFilter='blur(6px)'
		>
			<Flex direction='column' gap={8}>
				<VStack gap={2} align='stretch' w='full'>
					{links
						.filter((link) => link.to !== '/notifications')
						.map((link) => (
							<Link asChild variant='nav' size='sm' key={link.label}>
								<NavLink
									to={link.to}
									onClick={() => {
										if (currentPath === link.to) onSameRouteClick();
									}}
								>
									<HStack gap={2} justify='space-between' w='full'>
										<HStack gap={2}>
											<Icon as={getLinkIcon(link.to)} boxSize={4} />
											<Text>{link.label}</Text>
										</HStack>
									</HStack>
								</NavLink>
							</Link>
						))}
				</VStack>
			</Flex>
		</Flex>
	);
}
