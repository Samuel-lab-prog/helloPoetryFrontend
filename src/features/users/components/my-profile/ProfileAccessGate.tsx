import { Badge, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@root/core/base';

export function ProfileAccessGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 6, md: 8 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Profile
				</Badge>
				<Text textStyle='h2'>Sign in to view your profile</Text>
				<Text textStyle='body' color='pink.100'>
					Track saved poems, friend requests, and your stats in one place.
				</Text>
				<HStack gap={3} wrap='wrap'>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
						<NavLink to='/login'>Sign in</NavLink>
					</Button>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/register'>Create account</NavLink>
					</Button>
				</HStack>
			</VStack>
		</Surface>
	);
}
