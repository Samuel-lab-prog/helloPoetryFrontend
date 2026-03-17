import { Box, Flex, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { FooterBrand } from './FooterBrand';
import { FooterCommunity } from './FooterCommunity';
import { FooterNav } from './FooterNav';
import { FooterPrimaryActions } from './FooterPrimaryActions';
import { FooterSocial } from './FooterSocial';
import type { FooterLink } from './types';

type FooterProps = {
	links: FooterLink[];
};

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
					<VStack align='start' gap={3}>
						<FooterBrand />
						<FooterPrimaryActions />
					</VStack>
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

export type { FooterLink };
