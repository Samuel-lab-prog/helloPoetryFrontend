import { Text } from '@chakra-ui/react';

import type { MyProfileViewModel } from './types';

type ProfileReadOnlyProps = {
	profile: MyProfileViewModel;
};

export function ProfileReadOnly({ profile }: ProfileReadOnlyProps) {
	return (
		<>
			<Text textStyle={{ base: 'h4', md: 'h3' }}>{profile.name}</Text>
			<Text textStyle='smaller' color='pink.200'>
				@{profile.nickname}
			</Text>
			<Text textStyle='small'>{profile.bio || 'No bio.'}</Text>
		</>
	);
}
