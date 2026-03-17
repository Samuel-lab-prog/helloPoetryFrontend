import { Link, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import type { FooterLink } from './types';

export function FooterNav({ links }: { links: FooterLink[] }) {
	return (
		<VStack align='start' gap={2}>
			<Text textStyle='small' color='pink.200'>
				Navegação
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
