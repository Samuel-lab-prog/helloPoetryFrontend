import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
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
		<Box
			as={NavLink}
			to={`/authors/${poet.id}`}
			display='block'
			w='full'
			pt={2}
			pb={1}
			transition='background 0.2s ease, border-color 0.2s ease'
			_hover={{
				bg: 'rgba(255, 255, 255, 0.03)',
				borderColor: 'purple.600',
			}}
		>
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
			</Flex>
		</Box>
	);
}
