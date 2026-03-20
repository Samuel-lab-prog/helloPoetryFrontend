import { memo, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Avatar, Flex, Link, Text } from '@chakra-ui/react';

type PoemAuthorCardProps = {
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string | null;
	};
	stats: {
		likesCount: number;
		commentsCount: number;
	};
	embedded?: boolean;
	children: ReactNode;
};

export const PoemAuthorCard = memo(function PoemAuthorCard({
	author,
	stats,
	embedded = false,
	children,
}: PoemAuthorCardProps) {
	return (
		<Flex
			mt={embedded ? 5 : 6}
			pt={embedded ? 5 : 4}
			px={embedded ? 0 : 4}
			pb={embedded ? 0 : 4}
			gap={4}
			direction='column'
			borderTop={embedded ? '1px solid' : undefined}
			border={embedded ? undefined : '1px solid'}
			borderColor='purple.700'
			borderRadius={embedded ? undefined : 'lg'}
			bg={embedded ? 'transparent' : 'rgba(255, 255, 255, 0.02)'}
		>
			<Flex
				w='full'
				gap={3}
				align={{ base: 'start', md: 'center' }}
				direction={{ base: 'row', md: 'row' }}
			>
				<Avatar.Root size={{ base: 'lg', md: 'xl' }}>
					<Avatar.Image src={author.avatarUrl ?? undefined} />
					<Avatar.Fallback name={author.name} />
				</Avatar.Root>

				<Flex direction='column' gap={1} flex='1' minW={0}>
					<Text textStyle='small' color='pink.200'>
						Author
					</Text>
					<Text textStyle='body' wordBreak='break-word'>
						{author.name}
					</Text>
					<Text textStyle='smaller' color='pink.200' wordBreak='break-all'>
						@{author.nickname}
					</Text>
					<Text textStyle='smaller' color='pink.200'>
						Likes: {stats.likesCount} | Comments: {stats.commentsCount}
					</Text>
				</Flex>
			</Flex>

			<Flex
				w='full'
				gap={2}
				direction={{ base: 'column', md: 'row' }}
				align={{ base: 'stretch', md: 'center' }}
				justify='space-between'
			>
				<Link asChild textStyle='small' color='pink.100' alignSelf={{ base: 'start', md: 'auto' }}>
					<NavLink to={`/authors/${author.id}`}>View author</NavLink>
				</Link>
				{children}
			</Flex>
		</Flex>
	);
});
