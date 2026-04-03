import { Badge, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@BaseComponents';

/**
 * Renders a gate that restricts access to the user's profile if they are not signed in.
 * It encourages users to sign in or create an account to access their profile features.
 * @returns A React component that displays a message and buttons for signing in or creating an account. 
 */
export function ProfileAccessGate() {
	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
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
		</Flex>
	);
}
