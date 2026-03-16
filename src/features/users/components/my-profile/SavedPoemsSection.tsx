import { Flex, Heading, IconButton, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import { Surface, formatDate } from '@root/core/base';
import type { SavedPoemsSectionProps } from './types';

export function SavedPoemsSection({
	savedPoems,
	totalSavedPoemsCount,
	viewAllHref,
	isLoadingSavedPoems,
	isSavingPoem = false,
	saveError = '',
	onUnsavePoem,
}: SavedPoemsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Flex
				align={{ base: 'start', md: 'center' }}
				justify='space-between'
				direction={{ base: 'column', md: 'row' }}
				gap={3}
				mb={4}
			>
				<Heading as='h2' textStyle='h4' color='pink.300'>
					Poemas salvos
				</Heading>
				{viewAllHref && (
					<Link
						asChild
						textStyle='small'
						color='pink.200'
						textDecoration='underline'
						textUnderlineOffset='3px'
					>
						<NavLink to={viewAllHref}>Ver todos</NavLink>
					</Link>
				)}
			</Flex>

			<Flex direction='column' gap={3}>
				{isLoadingSavedPoems && <Text textStyle='small'>Carregando poemas salvos...</Text>}
				{!isLoadingSavedPoems && savedPoems.length === 0 && (
					<Text textStyle='small'>Voce ainda nao salvou poemas.</Text>
				)}
				{!isLoadingSavedPoems && Boolean(totalSavedPoemsCount) && (
					<Text textStyle='smaller' color='pink.200'>
						Mostrando {savedPoems.length} de {totalSavedPoemsCount} poemas salvos.
					</Text>
				)}

				{savedPoems.map((poem, index) => (
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
						animationName='slide-from-bottom, fade-in'
						animationDuration='320ms'
						animationTimingFunction='ease-out'
						animationFillMode='backwards'
						animationDelay={`${30 + index * 30}ms`}
					>
						<Flex direction='column' gap={1}>
							<Text textStyle='small'>{poem.title}</Text>
							<Text textStyle='smaller' color='pink.200'>
								Salvo em {formatDate(poem.savedAt)}
							</Text>
						</Flex>
						<Flex gap={2}>
							<IconButton
								aria-label='Abrir poema salvo'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								asChild
							>
								<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
									<ExternalLink />
								</NavLink>
							</IconButton>
							{onUnsavePoem && (
								<IconButton
									aria-label='Remover dos salvos'
									size={{ base: 'xs', md: 'sm' }}
									variant='solidPink'
									colorPalette='gray'
									loading={isSavingPoem}
									onClick={() => {
										void onUnsavePoem(poem.id);
									}}
								>
									<X />
								</IconButton>
							)}
						</Flex>
					</Flex>
				))}
			</Flex>
			{saveError && (
				<Text mt={3} textStyle='small' color='red.400'>
					{saveError}
				</Text>
			)}
		</Surface>
	);
}
