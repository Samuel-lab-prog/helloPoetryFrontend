import { Button, Flex, Heading } from '@chakra-ui/react';
import { LogOut } from 'lucide-react';

type ProfileHeaderProps = {
	isLoggingOut: boolean;
	onLogout: () => void;
};

export function ProfileHeader({ isLoggingOut, onLogout }: ProfileHeaderProps) {
	return (
		<Flex
			mb={8}
			align='center'
			justify='space-between'
			gap={3}
		>
			<Heading as='h1' textStyle='h2'>
				My Profile
			</Heading>
			<Button
				size='sm'
				variant='solidPink'
				loading={isLoggingOut}
				aria-label='Sign out'
				onClick={onLogout}
			>
				<LogOut size={16} />
			</Button>
		</Flex>
	);
}
