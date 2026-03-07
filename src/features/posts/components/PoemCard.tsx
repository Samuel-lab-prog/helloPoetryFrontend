import { Card, Text, Badge, Flex, Link, Box } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import type { PoemPreviewType } from '../types/types';

type PoemCardProps = {
	poem: PoemPreviewType;
};

export function PoemCard({ poem }: PoemCardProps) {
	return (
		<Card.Root
			p={5}
			h='full'
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			overflow='hidden'
			transition='background-color 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease, transform 0.2s ease'
			_hover={{
				borderColor: 'purple.500',
				bg: 'rgba(255, 255, 255, 0.04)',
				transform: 'translateY(-2px)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			_focusWithin={{
				borderColor: 'pink.400',
				bg: 'rgba(255, 255, 255, 0.06)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			animationName='fade-in'
			animationDuration='420ms'
			animationTimingFunction='ease-out'
		>
			<Box
				position='absolute'
				top='0'
				left='0'
				right='0'
				h='2px'
				bgGradient='linear(to-r, purple.500, pink.400)'
			/>

			<Card.Header p={0} mb={3} gap={3}>
				<Badge size='sm' colorPalette='pink' w='fit-content' variant='subtle'>
					Poema
				</Badge>
				<Card.Title as='h3' textStyle='h3'>
					{poem.title}
				</Card.Title>
			</Card.Header>

			<Card.Body p={0} flex='1'>
				<Flex direction='column' gap={2}>
					<Text textStyle='small' color='pink.100'>
						{poem.author.name}
					</Text>
					<Link asChild textStyle='smaller' color='pink.200' opacity={0.8}>
						<NavLink to={`/authors/${poem.author.id}`}>
							@{poem.author.nickname}
						</NavLink>
					</Link>
				</Flex>
			</Card.Body>

			<Card.Footer p={0} justifyContent='flex-end' mt={3}>
				<Link
					asChild
					textStyle='small'
					px={3}
					py={2}
					borderRadius='md'
					color='pink.100'
					border='1px solid'
					borderColor='purple.500'
					transition='all 0.2s ease'
					_hover={{
						color: 'pink.50',
						borderColor: 'pink.400',
						bg: 'rgba(255, 255, 255, 0.06)',
					}}
				>
					<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Ler poema</NavLink>
				</Link>
			</Card.Footer>
		</Card.Root>
	);
}
