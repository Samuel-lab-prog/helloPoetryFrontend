import { Link, Text, VStack } from '@chakra-ui/react';

export function FooterCommunity() {
	return (
		<VStack align='start' gap={2}>
			<Text textStyle='small' color='pink.200'>
				Community
			</Text>
			<Link
				href='https://github.com/samuel-lab-prog'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				Repository
			</Link>
			<Link
				href='https://www.linkedin.com/in/samuel-gomes-149251342/'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				LinkedIn
			</Link>
			<Link
				href='https://instagram.com/samuelgomes9930'
				target='_blank'
				rel='noreferrer'
				variant='muted'
				size='sm'
			>
				Instagram
			</Link>
		</VStack>
	);
}
