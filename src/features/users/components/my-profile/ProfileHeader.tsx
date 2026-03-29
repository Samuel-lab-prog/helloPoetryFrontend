import { Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { LogOut } from 'lucide-react';

type ProfileHeaderProps = {
	isLoggingOut: boolean;
	onLogout: () => void;
};

export function ProfileHeader({ isLoggingOut, onLogout }: ProfileHeaderProps) {
	return (
		<Flex
			mb={8}
			align={{ base: 'start', md: 'center' }}
			justify='space-between'
			direction={{ base: 'column', md: 'row' }}
			gap={3}
		>
			<VStack align='start' gap={1}>
				<Heading as='h1' textStyle='h2'>
					My Profile
				</Heading>
			</VStack>
			<Button
				size={{ base: 'sm', md: 'md' }}
				variant='solidPink'
				loading={isLoggingOut}
				w={{ base: 'full', md: 'auto' }}
				onClick={onLogout}
			>
				<HStack gap={2}>
					<LogOut size={16} />
					<Text>Sign out</Text>
				</HStack>
			</Button>
		</Flex>
	);
}
