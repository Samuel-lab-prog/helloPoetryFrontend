import { memo } from 'react';
import { keyframes } from '@emotion/react';
import { Button, Flex } from '@chakra-ui/react';
import { Bookmark, BookmarkCheck, Heart } from 'lucide-react';

const likePulse = keyframes`
	0% { transform: scale(1); }
	50% { transform: scale(1.06); }
	100% { transform: scale(1); }
`;

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
				colorPalette={likedPoem ? 'pink' : 'gray'}
				w={{ base: 'full', md: 'auto' }}
				isLoading={isUpdatingLike}
				isDisabled={isUpdatingLike}
				boxShadow={likedPoem ? '0 0 0 1px rgba(255, 92, 145, 0.6)' : undefined}
				_hover={
					likedPoem
						? { transform: 'translateY(-1px)', boxShadow: '0 6px 18px rgba(255,92,145,0.35)' }
						: undefined
				}
				_active={likedPoem ? { transform: 'scale(0.98)' } : undefined}
				animation={likedPoem ? `${likePulse} 220ms ease` : undefined}
				onClick={() => {
					if (isUpdatingLike) return;
					void onToggleLike();
				}}
			>
				<Heart size={16} fill={likedPoem ? 'currentColor' : 'none'} />
				{likedPoem ? 'Liked' : 'Like'}
			</Button>
			<Button
				aria-label={isSaved ? 'Remove from saved' : 'Save poem'}
				size='sm'
				variant='solidPink'
				w={{ base: 'full', md: 'auto' }}
				isLoading={isSavingPoem}
				isDisabled={isSavingPoem}
				onClick={() => {
					if (isSavingPoem) return;
					void onToggleSave();
				}}
			>
				{isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
				{isSaved ? 'Saved' : 'Save'}
			</Button>
		</Flex>
	);
});
