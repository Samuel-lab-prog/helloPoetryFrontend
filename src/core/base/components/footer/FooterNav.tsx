import { Link, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

type FooterLink = { label: string; to: string };

export function FooterNav({ links }: { links: FooterLink[] }) {
	return (
		<VStack align='start' gap={2}>
			<Text textStyle='small' color='pink.200'>
				Navegation
			</Text>
			{links.map((link) => (
				<Link
					asChild
					key={link.label}
					variant='muted'
					size='sm'
					_currentPage={{ color: 'pink.50', fontWeight: '600' }}
				>
					<NavLink to={link.to}>{link.label}</NavLink>
				</Link>
			))}
		</VStack>
	);
}
