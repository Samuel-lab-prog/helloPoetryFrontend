import { useEffect, useState } from 'react';
import { Avatar, Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { AsyncState, FormField } from '@features/base';
import { usePoetsSearch } from '../../poems/hooks/usePoetsSearch';

type SearchForm = {
  searchNickname: string;
};

export function PoetsPage() {
  const form = useForm<SearchForm>({
    defaultValues: {
      searchNickname: '',
    },
    mode: 'onChange',
  });

  const searchNickname = form.watch('searchNickname');
  const [debouncedSearch, setDebouncedSearch] = useState(searchNickname);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchNickname);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchNickname]);

  const { poets, isLoading, isError } = usePoetsSearch(debouncedSearch);

  return (
    <Flex
      as='main'
      layerStyle='main'
      direction='column'
    >
      <Flex
        as='section'
        mb={6}
        gap={6}
        direction='column'
        w='full'
      >
        <Heading
          as='h1'
          textStyle='h2'
        >
          Buscar Poetas
        </Heading>
        <Text
          textStyle='small'
          color='pink.200'
        >
          Encontre outros poetas por nickname.
        </Text>
        <FormField
          label='Pesquisar por nickname'
          name='searchNickname'
          control={form.control}
          type='text'
        />
      </Flex>

      <AsyncState
        isLoading={isLoading}
        isError={isError}
        isEmpty={poets.length === 0}
        loadingElement={<Text textStyle='body'>Buscando poetas...</Text>}
        errorElement={<Text textStyle='body'>Erro ao buscar poetas.</Text>}
        emptyElement={<Text textStyle='body'>Nenhum poeta encontrado.</Text>}
      >
        <Flex
          direction='column'
          gap={3}
        >
          {poets.map((poet) => (
            <Box
              key={poet.id}
              p={4}
              border='1px solid'
              borderColor='purple.700'
              borderRadius='xl'
              bg='rgba(255, 255, 255, 0.02)'
            >
              <Flex
                align='center'
                justify='space-between'
                gap={3}
              >
                <Flex
                  align='center'
                  gap={3}
                >
                  <Avatar.Root size='md'>
                    <Avatar.Image src={poet.avatarUrl ?? undefined} />
                    <Avatar.Fallback name={poet.nickname} />
                  </Avatar.Root>
                  <Flex direction='column'>
                    <Text textStyle='small'>@{poet.nickname}</Text>
                    <Text
                      textStyle='smaller'
                      color='pink.200'
                    >
                      Perfil publico
                    </Text>
                  </Flex>
                </Flex>
                <Link
                  asChild
                  textStyle='small'
                  px={3}
                  py={2}
                  borderRadius='md'
                  color='pink.100'
                  border='1px solid'
                  borderColor='purple.500'
                  transition='all 0.2s ease'
                  _hover={{
                    color: 'pink.50',
                    borderColor: 'pink.400',
                    bg: 'rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <NavLink to={`/authors/${poet.id}`}>Ver perfil</NavLink>
                </Link>
              </Flex>
            </Box>
          ))}
        </Flex>
      </AsyncState>
    </Flex>
  );
}
