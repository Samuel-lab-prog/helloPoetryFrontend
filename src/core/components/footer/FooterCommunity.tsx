import { Link, Text, VStack } from '@chakra-ui/react';

type Link = { label: string; href: string };

const links: Link[] = [
	{ label: 'Repository', href: 'https://github.com/samuel-lab-prog' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/samuel-gomes-149251342/' },
	{ label: 'Instagram', href: 'https://instagram.com/samuelgomes9930' },
];

export function FooterCommunity() {
	return (
		<VStack align='start' gap={2}>
			<Text textStyle='small' color='pink.200'>
				Development
			</Text>
			{links.map((link) => (
				<Link
					key={link.label}
					href={link.href}
					target='_blank'
					rel='noopener noreferrer'
					variant='muted'
					textStyle='smaller'
				>
					{link.label}
				</Link>
			))}
		</VStack>
	);
}
