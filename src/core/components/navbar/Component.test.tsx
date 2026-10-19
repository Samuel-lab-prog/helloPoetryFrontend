// @vitest-environment happy-dom
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Navbar } from './Component';

describe('Navbar', () => {
	it('renders the authentication and profile state supplied by the composition root', () => {
		render(
			<ChakraProvider value={defaultSystem}>
				<MemoryRouter>
					<Navbar
						links={[
							{ to: '/', label: 'Home' },
							{ to: '/notifications', label: 'Notifications' },
							{ to: '/admin/moderation', label: 'Moderation' },
						]}
						isAuthenticated
						canUseAuthenticatedShortcuts
						unreadCount={3}
						profile={{ avatarUrl: null, name: 'Ana Poet', nickname: 'ana' }}
						moderationPendingCount={2}
					/>
				</MemoryRouter>
			</ChakraProvider>,
		);

		expect(screen.getByRole('link', { name: 'Perfil' })).toBeTruthy();
		expect(screen.getAllByRole('link', { name: 'Notificações' }).length).toBeGreaterThan(0);
		expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
		expect(screen.getAllByText('3').length).toBeGreaterThan(0);
	});
});
