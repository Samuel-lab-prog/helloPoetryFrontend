import { memo } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { Bookmark, BookmarkCheck, Heart, HeartOff } from 'lucide-react';

type PoemActionsProps = {
	authClientId: number;
	likedPoem: boolean;
	isSaved: boolean;
	isUpdatingLike: boolean;
	isSavingPoem: boolean;
	onToggleLike: () => Promise<void>;
	onToggleSave: () => Promise<void>;
};

export const PoemActions = memo(function PoemActions({
	authClientId,
	likedPoem,
	isSaved,
	isUpdatingLike,
	isSavingPoem,
	onToggleLike,
	onToggleSave,
}: PoemActionsProps) {
	if (authClientId <= 0) return null;

	return (
		<Flex
			gap={2}
			w={{ base: 'full', md: 'auto' }}
			direction={{ base: 'column', md: 'row' }}
			align={{ base: 'stretch', md: 'center' }}
		>
			<Button
				aria-label={likedPoem ? 'Unlike poem' : 'Like poem'}
				size='sm'
				variant='solidPink'
				colorPalette='gray'
				w={{ base: 'full', md: 'auto' }}
				loading={isUpdatingLike}
				onClick={() => {
					void onToggleLike();
				}}
			>
				{likedPoem ? <HeartOff size={16} /> : <Heart size={16} />}
				{likedPoem ? 'Unlike' : 'Like'}
			</Button>
			<Button
				aria-label={isSaved ? 'Remove from saved' : 'Save poem'}
				size='sm'
				variant='solidPink'
				w={{ base: 'full', md: 'auto' }}
				loading={isSavingPoem}
				onClick={() => {
					void onToggleSave();
				}}
			>
				{isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
				{isSaved ? 'Saved' : 'Save'}
			</Button>
		</Flex>
	);
});
