import { Avatar, Button, Card, Flex, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export type PoetCardData = {
	id: number;
	name: string;
	nickname: string;
	avatarUrl: string | null;
};

type PoetCardProps = {
	poet: PoetCardData;
};

export function PoetCard({ poet }: PoetCardProps) {
	return (
		<Card.Root variant='interactive'>
			<Card.Body>
				<Flex align='center' justify='space-between' gap={2}>
					<Flex align='center' gap={3}>
						<Avatar.Root size='lg'>
							<Avatar.Image src={poet.avatarUrl ?? undefined} />
							<Avatar.Fallback name={poet.nickname} />
						</Avatar.Root>
						<Flex direction='column'>
							<Text textStyle='small'>{poet.name}</Text>
							<Text textStyle='small' color='pink.200'>
								@{poet.nickname}
							</Text>
						</Flex>
					</Flex>
					<Button asChild size={{ base: 'xs', md: 'sm' }} variant='ghostPink'>
						<NavLink to={`/authors/${poet.id}`}>Ver perfil</NavLink>
					</Button>
				</Flex>
			</Card.Body>
		</Card.Root>
	);
}
