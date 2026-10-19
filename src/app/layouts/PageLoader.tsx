import { Flex, Spinner } from '@chakra-ui/react';

export function PageLoader() {
	return (
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			minH='32vh'
			justify='center'
		>
			<Spinner size='lg' color='pink.300' />
		</Flex>
	);
}
