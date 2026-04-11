import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react';

import { FooterBrand } from './FooterBrand';
import { FooterCommunity } from './FooterCommunity';
import { FooterNav } from './FooterNav';

type FooterLink = { label: string; to: string };
type FooterProps = {
	links: FooterLink[];
};

export function Footer({ links }: FooterProps) {
	return (
		<Box
			as='footer'
			mt={{ base: 10, md: 14 }}
			px={{ base: 4, md: 4 }}
			pb={{ base: 'calc(92px + env(safe-area-inset-bottom, 0px))', md: 8 }}
			pt={0}
			borderColor='purple.700'
			bg='linear-gradient(180deg, rgba(18,0,17,0.75) 0%, rgba(18,0,17,0.92) 100%)'
		>
			<Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={8}>
				<GridItem colSpan={{ base: 2, md: 1 }}>
					<VStack align='center' gap={3}>
						<FooterBrand />
					</VStack>
				</GridItem>
				<GridItem>
					<FooterNav links={links} />
				</GridItem>
				<GridItem>
					<VStack align='start' gap={3}>
						<FooterCommunity />
					</VStack>
				</GridItem>
			</Grid>

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
					© {new Date().getFullYear()} HelloPoetry.
				</Text>
				<Text textStyle='smaller' color='pink.200'>
					Published for readers and authors.
				</Text>
			</Flex>
		</Box>
	);
}
