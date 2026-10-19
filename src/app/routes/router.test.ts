// @vitest-environment happy-dom

import { matchRoutes } from 'react-router-dom';

import { routes } from './router';

describe('application route matching', () => {
	it.each([
		['/', undefined],
		['/poets', 'poets'],
		['/poems/42', 'poems/:id'],
		['/poems/a-poem/42', 'poems/:slug/:id'],
		['/poems/42/immersive', 'poems/:id/immersive'],
		['/poems/a-poem/42/immersive', 'poems/:slug/:id/immersive'],
		['/authors/42', 'authors/:id'],
		['/login', '/login'],
		['/register', '/register'],
		['/poems/new', 'poems/new'],
		['/admin', 'admin'],
		['/admin/moderation', 'admin/moderation'],
		['/my-profile', 'my-profile'],
		['/my-profile/collections', 'my-profile/collections'],
		['/my-profile/friend-requests', 'my-profile/friend-requests'],
		['/my-profile/poems', 'my-profile/poems'],
		['/my-profile/saved-poems', 'my-profile/saved-poems'],
		['/notifications', 'notifications'],
	])('matches %s to the existing route entry', (pathname, expectedPath) => {
		const matches = matchRoutes(routes, pathname);
		expect(matches?.at(-1)?.route.path).toBe(expectedPath);
	});

	it('does not match unknown paths', () => {
		expect(matchRoutes(routes, '/not-a-hello-poetry-route')).toBeNull();
	});
});
