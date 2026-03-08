import { Avatar, Box, Flex, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export type PoetCardData = {
	id: number;
	nickname: string;
	avatarUrl: string | null;
};

type PoetCardProps = {
	poet: PoetCardData;
};

export function PoetCard({ poet }: PoetCardProps) {
	return (
		<Box
			p={4}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
		>
			<Flex align='center' justify='space-between' gap={3}>
				<Flex align='center' gap={3}>
					<Avatar.Root size='md'>
						<Avatar.Image src={poet.avatarUrl ?? undefined} />
						<Avatar.Fallback name={poet.nickname} />
					</Avatar.Root>
					<Flex direction='column'>
						<Text textStyle='small'>@{poet.nickname}</Text>
						<Text textStyle='smaller' color='pink.200'>
							Perfil publico
						</Text>
					</Flex>
				</Flex>
				<Link
					asChild
					variant='muted'
					size='sm'
					px={3}
					py={2}
					borderRadius='md'
					border='1px solid'
					borderColor='purple.500'
					_hover={{
						color: 'pink.50',
						borderColor: 'pink.400',
						bg: 'rgba(255, 255, 255, 0.06)',
					}}
				>
					<NavLink to={`/authors/${poet.id}`}>Ver perfil</NavLink>
				</Link>
			</Flex>
		</Box>
	);
}
