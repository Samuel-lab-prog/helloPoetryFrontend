import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface, formatDate } from '@features/base';
import type { SavedPoemsSectionProps } from './types';

export function SavedPoemsSection({ savedPoems, isLoadingSavedPoems }: SavedPoemsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
				Poemas salvos
			</Heading>

			<Flex direction='column' gap={3}>
				{isLoadingSavedPoems && <Text textStyle='small'>Carregando poemas salvos...</Text>}
				{!isLoadingSavedPoems && savedPoems.length === 0 && (
					<Text textStyle='small'>Voce ainda nao salvou poemas.</Text>
				)}

				{savedPoems.map((poem) => (
					<Flex
						key={poem.id}
						align={{ base: 'start', md: 'center' }}
						justify='space-between'
						direction={{ base: 'column', md: 'row' }}
						gap={3}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<Flex direction='column' gap={1}>
							<Text textStyle='small'>{poem.title}</Text>
							<Text textStyle='smaller' color='pink.200'>
								Salvo em {formatDate(poem.savedAt)}
							</Text>
						</Flex>
						<Button size={{ base: 'xs', md: 'sm' }} variant='solidPink' asChild>
							<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Abrir</NavLink>
						</Button>
					</Flex>
				))}
			</Flex>
		</Surface>
	);
}
