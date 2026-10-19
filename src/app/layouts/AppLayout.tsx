import { moderation } from '@Api';
import { Navbar } from '@BaseComponents';
import { useAuthClientStore } from '@features/auth/public';
import { canUseModerationTools } from '@features/moderation/public';
import { useMyProfile } from '@features/users/public/hooks/useMyProfile';
import { useQuery } from '@tanstack/react-query';

import { createRoutePrefetcher } from '../routes/prefetch';

function generateNavLinks(
	isAuthenticated: boolean,
	authClient?: Parameters<typeof canUseModerationTools>[0],
) {
	const links = [
		{ to: '/', label: 'Home' },
		{ to: '/poets', label: 'Poets' },
	];
	if (isAuthenticated) {
		if (authClient?.status !== 'banned') {
			links.push({ to: '/poems/new', label: 'Create' });
		}
		links.push({ to: '/my-profile', label: 'My Profile' });
		if (authClient?.status !== 'banned') {
			links.push({ to: '/notifications', label: 'Notifications' });
		}
		if (canUseModerationTools(authClient)) {
			links.push({ to: '/admin/moderation', label: 'Moderation' });
		}
	} else {
		links.push({ to: '/register', label: 'Sign up' });
		links.push({ to: '/login', label: 'Sign in' });
	}
	return links;
}

export function AppLayout() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);
	const { profile } = useMyProfile();
	const canSeeModerationBadge = canUseModerationTools(authClient);
	const { data: moderationPendingCount = 0 } = useQuery({
		...moderation.getPendingPoems.query(),
		enabled: canSeeModerationBadge,
		staleTime: 1000 * 30,
		select: (pendingPoems) => pendingPoems.length,
	});
	const isAuthenticated = Boolean(authClient);
	const navLinks = generateNavLinks(isAuthenticated, authClient);
	const prefetchRoute = createRoutePrefetcher(authClient?.id);

	return (
		<Navbar
			links={navLinks}
			isAuthenticated={isAuthenticated}
			canUseAuthenticatedShortcuts={authClient?.status !== 'banned'}
			unreadCount={unreadCount}
			profile={profile}
			moderationPendingCount={moderationPendingCount}
			onPrefetchRoute={prefetchRoute}
		/>
	);
}
