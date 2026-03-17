import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { Button, HStack, Link } from '@chakra-ui/react';

const socials = [
	{
		href: 'https://github.com/samuel-lab-prog',
		icon: FaGithub,
		label: 'GitHub',
	},
	{
		href: 'https://www.linkedin.com/in/samuel-gomes-149251342/',
		icon: FaLinkedin,
		label: 'LinkedIn',
	},
	{
		href: 'https://instagram.com/samuelgomes9930',
		icon: FaInstagram,
		label: 'Instagram',
	},
];

export function FooterSocial() {
	return (
		<HStack gap={2}>
			{socials.map((social) => (
				<Button key={social.label} asChild size='sm' variant='solidPink' aria-label={social.label}>
					<Link href={social.href} target='_blank' rel='noreferrer'>
						<social.icon />
					</Link>
				</Button>
			))}
		</HStack>
	);
}
