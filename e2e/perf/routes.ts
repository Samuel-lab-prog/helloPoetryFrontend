export type Route = {
	name: string;
	path: string;
	linkText?: string;
	waitForText?: string;
};

export const routes: Route[] = [
	{ name: 'Home', path: '/', linkText: 'Home', waitForText: 'Search poems' },
	{ name: 'Poets', path: '/poets', linkText: 'Poets', waitForText: 'Search poets' },
	{ name: 'Poem (id)', path: '/poems/1' },
	{ name: 'Poem (slug/id)', path: '/poems/first-poem/1' },
	{ name: 'Poem Immersive (id)', path: '/poems/1/immersive' },
	{ name: 'Poem Immersive (slug/id)', path: '/poems/first-poem/1/immersive' },
	{ name: 'Author', path: '/authors/1' },
	{ name: 'Login', path: '/login', linkText: 'Sign in', waitForText: 'Sign in' },
	{ name: 'Register', path: '/register', linkText: 'Sign up', waitForText: 'Create account' },
	{ name: 'Create Poem', path: '/poems/new', waitForText: 'Sign in to create a poem' },
	{ name: 'Admin', path: '/admin', waitForText: 'Admin Panel' },
	{ name: 'Moderation', path: '/admin/moderation', waitForText: 'Restricted access' },
	{ name: 'My Profile', path: '/my-profile', waitForText: 'Sign in to view your profile' },
	{
		name: 'My Collections',
		path: '/my-profile/collections',
		waitForText: 'Sign in to view your profile',
	},
	{
		name: 'Friend Requests',
		path: '/my-profile/friend-requests',
		waitForText: 'Sign in to view your profile',
	},
	{ name: 'My Poems', path: '/my-profile/poems', waitForText: 'Sign in to view your profile' },
	{
		name: 'Saved Poems',
		path: '/my-profile/saved-poems',
		waitForText: 'Sign in to view your profile',
	},
	{ name: 'Notifications', path: '/notifications', waitForText: 'Notifications' },
];
