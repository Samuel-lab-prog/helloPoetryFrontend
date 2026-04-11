type FooterLink = { label: string; to: string };

export function getFooterLinks(isAuthenticated: boolean): FooterLink[] {
	const links: FooterLink[] = [{ label: 'Home', to: '/' }];

	if (isAuthenticated) {
		links.push({ label: 'Create poem', to: '/poems/new' });
		links.push({ label: 'My profile', to: '/my-profile' });
		return links;
	}

	links.push({ label: 'Sign up', to: '/register' });
	links.push({ label: 'Sign in', to: '/login' });

	return links;
}

export function getPageTitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
	if (!isAuthenticated) return 'Recent poems';
	return isPersonalizedFeed ? 'Your feed' : 'Home';
}

export function getPageSubtitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
	if (!isAuthenticated) return 'Discover new texts published in the community.';

	return isPersonalizedFeed
		? 'Poems from friends and authors you follow.'
		: 'Showing the most recent poems while the personalized feed is unavailable.';
}
