type FooterLink = { label: string; to: string };

export function getFooterLinks(isAuthenticated: boolean): FooterLink[] {
	const links: FooterLink[] = [
		{ label: 'Inicio', to: '/' },
		{ label: 'Poemas', to: '/poems' },
	];

	if (isAuthenticated) {
		links.push({ label: 'Criar poema', to: '/poems/new' });
		links.push({ label: 'Meu perfil', to: '/my-profile' });
		return links;
	}

	links.push({ label: 'Cadastrar', to: '/register' });
	links.push({ label: 'Entrar', to: '/login' });

	return links;
}

export function getPageTitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
	if (!isAuthenticated) return 'Poemas recentes';
	return isPersonalizedFeed ? 'Seu feed' : 'Inicio';
}

export function getPageSubtitle(isAuthenticated: boolean, isPersonalizedFeed: boolean) {
	if (!isAuthenticated) return 'Descubra novos textos publicados na comunidade.';

	return isPersonalizedFeed
		? 'Poemas de amigos e autores que voce acompanha.'
		: 'Mostrando poemas mais recentes enquanto o feed personalizado nao estiver disponivel.';
}
