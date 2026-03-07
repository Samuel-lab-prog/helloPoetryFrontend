import { Text } from '@chakra-ui/react';

type AsyncStateProps = {
	isLoading?: boolean;
	isError?: boolean;
	isEmpty?: boolean;

	loadingElement?: React.ReactNode;
	errorElement?: React.ReactNode;
	emptyElement?: React.ReactNode;

	children: React.ReactNode;
};

export function AsyncState({
	isLoading = false,
	isError = false,
	isEmpty = false,
	loadingElement,
	errorElement,
	emptyElement,
	children,
}: AsyncStateProps) {
	if (isError)
		return errorElement || <Text textStyle='body'>Error occurred.</Text>;
	if (isLoading)
		return loadingElement || <Text textStyle='body'>Loading...</Text>;
	if (isEmpty)
		return emptyElement || <Text textStyle='body'>No data available.</Text>;

	return children;
}
