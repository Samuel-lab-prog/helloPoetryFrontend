import { Avatar, Flex, Link, Text } from '@chakra-ui/react';
import { ModerationActionsMenu } from '@features/moderation/public';
import { NavLink } from 'react-router-dom';

export type PoetCardData = {
	id: number;
	name: string;
	nickname: string;
	avatarUrl: string | null;
	role?: string;
	status?: string;
};

type PoetCardProps = {
	poet: PoetCardData;
};

export function PoetCard({ poet }: PoetCardProps) {
	return (
		<Flex
			align='center'
			justify='space-between'
			gap={2}
			w='full'
			py={{ base: 2.5, md: 3 }}
			px={{ base: 3.5, md: 4 }}
			borderRadius='lg'
			transition='background-color 0.22s ease'
			_hover={{
				bg: 'rgba(255, 255, 255, 0.03)',
			}}
		>
			<Link asChild display='block' flex='1' minW={0} _hover={{ textDecoration: 'none' }}>
				<NavLink to={`/authors/${poet.id}`}>
					<Flex align='center' gap={3} minW={0}>
						<Avatar.Root size={{ base: 'xs', md: 'md' }}>
							<Avatar.Image src={poet.avatarUrl ?? undefined} />
							<Avatar.Fallback name={poet.nickname} />
						</Avatar.Root>
						<Flex direction='column' minW={0}>
							<Text textStyle='small' color='pink.100' lineHeight='short' truncate>
								{poet.name}
							</Text>
							<Text textStyle='smaller' color='pink.200' opacity={0.9}>
								@{poet.nickname}
							</Text>
						</Flex>
					</Flex>
				</NavLink>
			</Link>
			<ModerationActionsMenu
				user={{
					id: poet.id,
					name: poet.name,
					nickname: poet.nickname,
					role: poet.role,
					status: poet.status,
					avatarUrl: poet.avatarUrl,
				}}
				size='xs'
				variant='ghost'
				ariaLabel='Open user moderation actions'
			/>
		</Flex>
	);
}
