import { Text } from '@chakra-ui/react';

import type { MyProfileViewModel } from './types';

type ProfileReadOnlyProps = {
	profile: MyProfileViewModel;
};

export function ProfileReadOnly({ profile }: ProfileReadOnlyProps) {
	return (
		<>
			<Text textStyle='h3'>{profile.name}</Text>
			<Text textStyle='small' color='pink.200'>
				@{profile.nickname}
			</Text>
			<Text textStyle='body'>{profile.bio || 'No bio.'}</Text>
		</>
	);
}
