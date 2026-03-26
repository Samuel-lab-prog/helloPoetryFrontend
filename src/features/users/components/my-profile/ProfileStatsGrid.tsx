import { Box, Grid, Text } from '@chakra-ui/react';
import type { MyProfileViewModel } from './types';

type ProfileStatsGridProps = {
	profile: MyProfileViewModel;
};

export function ProfileStatsGrid({ profile }: ProfileStatsGridProps) {
	return (
		<Grid mt={5} templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
			<Box
				p={4}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='xl'
				bg='rgba(255, 255, 255, 0.02)'
			>
				<Text textStyle='smaller' color='pink.200'>
					Poems
				</Text>
				<Text textStyle='h3'>{profile.stats?.poems?.length ?? 0}</Text>
			</Box>
			<Box
				p={4}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='xl'
				bg='rgba(255, 255, 255, 0.02)'
			>
				<Text textStyle='smaller' color='pink.200'>
					Comments
				</Text>
				<Text textStyle='h3'>{profile.stats?.commentsIds?.length ?? 0}</Text>
			</Box>
			<Box
				p={4}
				border='1px solid'
				borderColor='purple.700'
				borderRadius='xl'
				bg='rgba(255, 255, 255, 0.02)'
			>
				<Text textStyle='smaller' color='pink.200'>
					Friends
				</Text>
				<Text textStyle='h3'>{profile.stats?.friends?.length ?? 0}</Text>
			</Box>
		</Grid>
	);
}
