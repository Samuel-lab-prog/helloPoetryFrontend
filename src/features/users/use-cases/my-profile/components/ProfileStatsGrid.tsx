import { Flex, Text } from '@chakra-ui/react';
import { BookOpen, MessageSquare, Users } from 'lucide-react';

import type { MyProfileViewModel } from '../../../public/components/my-profile/types';

type ProfileStatsGridProps = {
	profile: MyProfileViewModel;
};

export function ProfileStatsGrid({ profile }: ProfileStatsGridProps) {
	return (
		<Flex mt={5} direction={{ base: 'column', sm: 'row' }}>
			<Flex
				flex='1'
				p={4}
				gap={3}
				align='center'
				borderBottomWidth={{ base: '1px', sm: '0' }}
				borderBottomStyle='solid'
				borderBottomColor='pink.300'
				borderRightWidth={{ base: '0', sm: '1px' }}
				borderRightStyle='solid'
				borderRightColor='pink.300'
			>
				<BookOpen size={18} />
				<Flex direction='column'>
					<Text textStyle='smaller' color='pink.200'>
						Poems
					</Text>
					<Text textStyle='h3'>{profile.stats?.poems?.length ?? 0}</Text>
				</Flex>
			</Flex>
			<Flex
				flex='1'
				p={4}
				gap={3}
				align='center'
				borderBottomWidth={{ base: '1px', sm: '0' }}
				borderBottomStyle='solid'
				borderBottomColor='pink.300'
				borderRightWidth={{ base: '0', sm: '1px' }}
				borderRightStyle='solid'
				borderRightColor='pink.300'
			>
				<MessageSquare size={18} />
				<Flex direction='column'>
					<Text textStyle='smaller' color='pink.200'>
						Comments
					</Text>
					<Text textStyle='h3'>{profile.stats?.commentsIds?.length ?? 0}</Text>
				</Flex>
			</Flex>
			<Flex flex='1' p={4} gap={3} align='center'>
				<Users size={18} />
				<Flex direction='column'>
					<Text textStyle='smaller' color='pink.200'>
						Friends
					</Text>
					<Text textStyle='h3'>{profile.stats?.friends?.length ?? 0}</Text>
				</Flex>
			</Flex>
		</Flex>
	);
}
