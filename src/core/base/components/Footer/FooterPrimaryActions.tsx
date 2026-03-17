import { Button, HStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

type LinkItem = {
	label: string;
	to: string;
};

const links: LinkItem[] = [
	{ label: 'Explorar poemas', to: '/poems' },
	{ label: 'Criar poema', to: '/poems/new' },
];

export function FooterPrimaryActions() {
	return (
		<HStack gap={2} flexWrap='wrap'>
			{links.map((link) => (
				<Button key={link.to} asChild variant='solidPink'>
					<NavLink to={link.to}>{link.label}</NavLink>
				</Button>
			))}
		</HStack>
	);
}
