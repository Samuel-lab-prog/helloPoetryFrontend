import { Flex, Button } from '@chakra-ui/react';

type PoemsLoadMoreProps = {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
};

export function PoemsLoadMore({ hasNextPage, isFetchingNextPage, onLoadMore }: PoemsLoadMoreProps) {
	return (
		<Flex justify={['end', 'end', 'end', 'center']}>
			{hasNextPage && (
				<Button
					onClick={onLoadMore}
					disabled={!hasNextPage}
					loading={isFetchingNextPage}
					mt={8}
					loadingText='Loading...'
					alignSelf='center'
					variant='solidPink'
				>
					{isFetchingNextPage ? 'Loading...' : 'Load more'}
				</Button>
			)}
		</Flex>
	);
}
