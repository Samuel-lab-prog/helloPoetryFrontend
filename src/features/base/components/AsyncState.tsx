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

/**
 * A utility component to handle asynchronous states (loading, error, empty) in a consistent way.
 * @example
 * <AsyncState
 *   isLoading={isLoading}
 *   isError={isError}
 *   isEmpty={!data || data.length === 0}
 *   loadingElement={<Spinner />}
 *   errorElement={<Text>Error loading data</Text>}
 *   emptyElement={<Text>No data found</Text>}
 * >
 *   {data.map(item => <ItemCard key={item.id} item={item} />)}
 * </AsyncState>
 */
export function AsyncState({
	isLoading = false,
	isError = false,
	isEmpty = false,
	loadingElement,
	errorElement,
	emptyElement,
	children,
}: AsyncStateProps) {
	if (isError) return errorElement || <Text textStyle='body'>Error occurred.</Text>;
	if (isLoading) return loadingElement || <Text textStyle='body'>Loading...</Text>;
	if (isEmpty) return emptyElement || <Text textStyle='body'>No data available.</Text>;

	return children;
}
