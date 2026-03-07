import { PoemCard } from './PoemCard';
import type { PoemPreviewType } from '../types/types';

type PostCardProps = {
	post: PoemPreviewType;
};

export function PostCard({ post }: PostCardProps) {
	return <PoemCard poem={post} />;
}
