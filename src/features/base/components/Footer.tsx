import logo from '@assets/logo.svg';

import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

import {
	Box,
	HStack,
	VStack,
	Text,
	Image,
	Link,
	IconButton,
} from '@chakra-ui/react';
import { NavLink, useNavigate } from 'react-router-dom';

/* ---------------- LOGO ---------------- */
function FooterLogo() {
	const navigate = useNavigate();

	return (
		<Box
			onClick={() => navigate('/')}
			cursor='pointer'
			_hover={{ opacity: 0.6, transition: 'all 0.2s' }}
		>
			<Image
				src={logo}
				alt='Logo'
				h='70px'
			/>
		</Box>
	);
}

/* ---------------- FOOTER LINKS ---------------- */
function FooterLinks({ links }: { links: { label: string; to: string }[] }) {
	return (
		<HStack
			gap={8}
			flexWrap='wrap'
			justify='center'
		>
			{links.map((link) => (
				<Link
					asChild
					key={link.label}
					color='gray.600'
					textStyle='small'
					_hover={{ color: 'gray.900', textDecoration: 'underline' }}
					_currentPage={{ fontWeight: 'bold' }}
				>
					<NavLink to={link.to}>{link.label}</NavLink>
				</Link>
			))}
		</HStack>
	);
}

/* ---------------- FOOTER ---------------- */
export function Footer({ links }: { links: { label: string; to: string }[] }) {
	return (
		<Box
			as='footer'
			borderTop='2px solid'
			borderColor='gray.200'
			px={{ base: 6, lg: 12 }}
			pb={10}
		>
			<VStack
				gap={6}
				align='center'
			>
				<FooterLogo />

				<FooterLinks links={links} />

				<HStack gap={4}>
					<IconButton
						variant='plain'
						asChild
					>
						<Link href='https://github.com/samuel-lab-prog'>
							<FaGithub />
						</Link>
					</IconButton>
					<IconButton
						variant='plain'
						asChild
					>
						<Link href='https://www.linkedin.com/in/samuel-gomes-149251342/'>
							<FaLinkedin />
						</Link>
					</IconButton>
					<IconButton
						variant='plain'
						asChild
					>
						<Link href='https://instagram.com/samuelgomes9930'>
							<FaInstagram />
						</Link>
					</IconButton>
				</HStack>

				<Text
					fontSize='sm'
					color='gray.500'
					textAlign='center'
				>
					© {new Date().getFullYear()} — Todos os direitos reservados
				</Text>
			</VStack>
		</Box>
	);
}
