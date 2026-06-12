import { Flex, Text } from '@chakra-ui/react';
import { BookOpen, MessageSquare, Users } from 'lucide-react';

import type { MyProfileViewModel } from '../../../public/components/my-profile/types';

type ProfileStatsGridProps = {
	profile: MyProfileViewModel;
};

export function ProfileStatsGrid({ profile }: ProfileStatsGridProps) {
	return (
		<Flex mt={4} direction='row'>
			<Flex
				flex='1'
				p={{ base: 3, md: 4 }}
				gap={2}
				align='center'
				borderRightWidth='1px'
				borderRightStyle='solid'
				borderRightColor='pink.300'
			>
				<BookOpen size={18} />
				<Flex direction='column' minW={0}>
					<Text textStyle='smaller' color='pink.200'>
						Poems
					</Text>
					<Text textStyle={{ base: 'h4', md: 'h3' }}>{profile.stats?.poems?.length ?? 0}</Text>
				</Flex>
			</Flex>
			<Flex
				flex='1'
				p={{ base: 3, md: 4 }}
				gap={2}
				align='center'
				borderRightWidth='1px'
				borderRightStyle='solid'
				borderRightColor='pink.300'
			>
				<MessageSquare size={18} />
				<Flex direction='column' minW={0}>
					<Text textStyle='smaller' color='pink.200'>
						Comments
					</Text>
					<Text textStyle={{ base: 'h4', md: 'h3' }}>
						{profile.stats?.commentsIds?.length ?? 0}
					</Text>
				</Flex>
			</Flex>
			<Flex flex='1' p={{ base: 3, md: 4 }} gap={2} align='center'>
				<Users size={18} />
				<Flex direction='column' minW={0}>
					<Text textStyle='smaller' color='pink.200'>
						Friends
					</Text>
					<Text textStyle={{ base: 'h4', md: 'h3' }}>{profile.stats?.friends?.length ?? 0}</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}
