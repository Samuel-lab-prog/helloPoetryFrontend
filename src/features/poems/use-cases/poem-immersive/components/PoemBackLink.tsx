import { Link } from '@chakra-ui/react';
import { ArrowLeftIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface PoemBackLinkProps {
	poemId: number;
	poemSlug?: string | null;
}

export function PoemBackLink({ poemId, poemSlug }: PoemBackLinkProps) {
	return (
		<Link
			asChild
			display='inline-flex'
			alignItems='center'
			gap={2}
			mb={6}
			color='pink.200'
			_hover={{ color: 'pink.50' }}
		>
			<NavLink to={poemSlug ? `/poems/${poemSlug}/${poemId}` : `/poems/${poemId}`}>
				<ArrowLeftIcon /> Back to poem
			</NavLink>
		</Link>
	);
}
