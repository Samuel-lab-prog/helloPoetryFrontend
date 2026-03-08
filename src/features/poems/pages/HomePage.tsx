import { useMemo } from 'react';
import { Flex, Heading, Text } from '@chakra-ui/react';
import { AsyncState, Footer } from '@features/base';
import { PoemCard } from '../components/PoemCard';
import { PoemGrid } from '../components/PoemGrid';
import { useHomeFeed } from '../hooks/useHomeFeed';

function getAuthClientId() {
  try {
    const raw = localStorage.getItem('auth-client');
    if (!raw) return -1;
    const parsed = JSON.parse(raw) as { id?: number };
    return typeof parsed.id === 'number' && parsed.id > 0 ? parsed.id : -1;
  } catch {
    return -1;
  }
}

export function HomePage() {
  const authClientId = getAuthClientId();
  const isAuthenticated = authClientId > 0;
  const { poems, isError, isLoading, isPersonalizedFeed } = useHomeFeed({
    isAuthenticated,
    limit: isAuthenticated ? 8 : 4,
  });

  const footerLinks = useMemo(
    () => [
      { label: 'Início', to: '/' },
      { label: 'Poemas', to: '/poems' },
      ...(isAuthenticated
        ? [
          { label: 'Criar poema', to: '/poems/new' },
          { label: 'Meu perfil', to: '/my-profile' },
        ]
        : [
          { label: 'Cadastrar', to: '/register' },
          { label: 'Entrar', to: '/login' },
        ]),
    ],
    [isAuthenticated],
  );

  return (
    <>
      <Flex
        as='main'
        layerStyle='main'
        direction='column'
      >
        <Flex
          as='section'
          direction='column'
          w='full'
          py='4'
          gap={4}
        >
          {isAuthenticated && (
            <Flex
              direction='column'
              gap={1}
              px={{ base: 1, md: 2 }}
            >
              <Heading
                as='h1'
                textStyle='h2'
              >
                {isPersonalizedFeed ? 'Seu feed' : 'Início'}
              </Heading>
              <Text
                textStyle='small'
                color='pink.200'
              >
                {isPersonalizedFeed
                  ? 'Poemas de amigos e autores que você acompanha.'
                  : 'Mostrando poemas mais recentes enquanto o feed personalizado não estiver disponível.'}
              </Text>
            </Flex>
          )}

          <PoemGrid>
            <AsyncState
              isLoading={isLoading}
              isError={isError}
              isEmpty={!poems || poems.length === 0}
              emptyElement={
                <Flex textStyle='body'>Nenhum poema encontrado</Flex>
              }
              errorElement={
                <Flex textStyle='body'>Erro ao carregar poemas</Flex>
              }
              loadingElement={
                <Flex textStyle='body'>Carregando poemas...</Flex>
              }
            >
              {poems.map((poem) => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                />
              ))}
            </AsyncState>
          </PoemGrid>
        </Flex>
      </Flex>
      <Footer links={footerLinks} />
    </>
  );
}
