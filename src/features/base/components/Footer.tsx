import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	HStack,
	Link,
	SimpleGrid,
	Text,
	VStack,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

type FooterLink = { label: string; to: string };

type FooterProps = {
	links: FooterLink[];
};

function FooterBrand() {
	return (
		<VStack align='start' gap={3}>
			<HStack gap={3}>
				<Box
					w='44px'
					h='44px'
					display='grid'
					placeItems='center'
					borderRadius='full'
					bg='linear-gradient(135deg, {colors.purple.600}, {colors.pink.400})'
					color='white'
					fontWeight='700'
					fontSize='sm'
				>
					OP
				</Box>
				<VStack align='start' gap={0}>
					<Heading as='h3' textStyle='h4' color='pink.100'>
						Olapoesia
					</Heading>
					<Badge size='sm' colorPalette='pink' variant='subtle'>
						Plataforma de Poemas
					</Badge>
				</VStack>
			</HStack>

			<Text textStyle='small' color='pink.200' maxW='sm'>
				Publique poemas, salve favoritos, comente e construa conexoes com outros autores.
			</Text>

			<HStack gap={2} flexWrap='wrap'>
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/poems'>Explorar poemas</NavLink>
				</Button>
				<Button size='sm' variant='solidPink' colorPalette='gray' asChild>
					<NavLink to='/poems/new'>Criar poema</NavLink>
				</Button>
			</HStack>
		</VStack>
	);
}

function FooterNav({ links }: { links: FooterLink[] }) {
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

function FooterCommunity() {
	return (
		<VStack align='start' gap={2}>
			<Text textStyle='small' color='pink.200'>
				Comunidade
			</Text>
			<Link
				href='https://github.com/samuel-lab-prog'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				Repositorio
			</Link>
			<Link
				href='https://www.linkedin.com/in/samuel-gomes-149251342/'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				LinkedIn
			</Link>
			<Link
				href='https://instagram.com/samuelgomes9930'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				Instagram
			</Link>
		</VStack>
	);
}

function FooterSocial() {
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

export function Footer({ links }: FooterProps) {
	return (
		<Box
			as='footer'
			mt={{ base: 10, md: 14 }}
			px={{ base: 4, md: 8 }}
			pb={{ base: 'calc(92px + env(safe-area-inset-bottom, 0px))', md: 8 }}
			borderColor='purple.700'
			bg='linear-gradient(180deg, rgba(18,0,17,0.75) 0%, rgba(18,0,17,0.92) 100%)'
		>
			<Box
				w='full'
				mx='auto'
				pt={10}
				pb={6}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='2xl'
				bg='rgba(255, 255, 255, 0.02)'
				backdropFilter='blur(4px)'
				px={{ base: 4, md: 6 }}
			>
				<SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
					<FooterBrand />
					<FooterNav links={links} />
					<VStack align='start' gap={3}>
						<FooterCommunity />
						<FooterSocial />
					</VStack>
				</SimpleGrid>

				<Flex
					mt={8}
					pt={4}
					borderTop='1px solid'
					borderColor='purple.700'
					justify='space-between'
					align={{ base: 'start', md: 'center' }}
					direction={{ base: 'column', md: 'row' }}
					gap={2}
				>
					<Text textStyle='smaller' color='pink.200'>
						© {new Date().getFullYear()} Olapoesia. Todos os direitos reservados.
					</Text>
					<Text textStyle='smaller' color='pink.200'>
						Feito para leitores e autores.
					</Text>
				</Flex>
			</Box>
		</Box>
	);
}
