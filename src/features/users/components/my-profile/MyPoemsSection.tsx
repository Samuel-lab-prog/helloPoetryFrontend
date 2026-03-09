import {
	Badge,
	Flex,
	Heading,
	HStack,
	IconButton,
	Link,
	Menu,
	Portal,
	Text,
} from '@chakra-ui/react';
import { EllipsisVertical } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Surface, formatDate } from '@features/base';
import type { MyPoemsSectionProps } from './types';

function translateStatus(status: string) {
	switch (status) {
		case 'draft':
			return 'Rascunho';
		case 'published':
			return 'Publicado';
		default:
			return status;
	}
}

function translateVisibility(visibility: string) {
	switch (visibility) {
		case 'public':
			return 'Público';
		case 'friends':
			return 'Amigos';
		case 'private':
			return 'Privado';
		case 'unlisted':
			return 'Não listado';
		default:
			return visibility;
	}
}

export function MyPoemsSection({
	myPoems,
	totalPoemsCount,
	viewAllHref,
	isLoadingMyPoems,
	isMyPoemsError,
	onOpenPoem,
	onUpdatePoem,
	onDeletePoem,
}: MyPoemsSectionProps) {
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
					Meus poemas
				</Heading>
				{viewAllHref && (totalPoemsCount ?? myPoems.length) > myPoems.length && (
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
				{isLoadingMyPoems && <Text textStyle='small'>Carregando meus poemas...</Text>}
				{!isLoadingMyPoems && !isMyPoemsError && myPoems.length === 0 && (
					<Text textStyle='small'>Você ainda não publicou poemas.</Text>
				)}
				{isMyPoemsError && (
					<Text textStyle='small' color='red.400'>
						Erro ao carregar seus poemas.
					</Text>
				)}

				{myPoems.map((poem, index) => (
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
						<Flex direction='column' gap={1} flex='1'>
							<Text textStyle='small'>{poem.title}</Text>
							<Text textStyle='smaller' color='pink.200'>
								{formatDate(poem.createdAt)} | {translateStatus(poem.status)} |{' '}
								{translateVisibility(poem.visibility)}
							</Text>
							{poem.stats && (
								<Text textStyle='smaller' color='pink.200'>
									{poem.stats.likesCount} curtidas | {poem.stats.commentsCount} comentários
								</Text>
							)}
							{poem.tags?.length > 0 && (
								<HStack gap={1} wrap='wrap'>
									{poem.tags.slice(0, 4).map((tag) => (
										<Badge key={tag.id} size='sm' colorPalette='pink' variant='subtle'>
											#{tag.name}
										</Badge>
									))}
								</HStack>
							)}
						</Flex>

						<Menu.Root positioning={{ placement: 'bottom-end' }}>
							<Menu.Trigger asChild>
								<IconButton
									aria-label='Abrir menu de a��es'
									variant='solidPink'
									size={{ base: 'xs', md: 'sm' }} 
									alignSelf={{ base: 'end', md: 'auto' }}
								>
									<EllipsisVertical />
								</IconButton>
							</Menu.Trigger>
							<Portal>
								<Menu.Positioner>
									<Menu.Content
										bg='rgba(27, 0, 25, 0.98)'
										border='1px solid'
										borderColor='purple.700'
									>
										<Menu.Item
											value={`open-${poem.id}`}
											color='pink.100'
											_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
											onClick={() => onOpenPoem(poem.slug, poem.id)}
										>
											Abrir
										</Menu.Item>
										<Menu.Item
											value={`update-${poem.id}`}
											color='pink.100'
											_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
											onClick={() => onUpdatePoem(poem.id)}
										>
											Atualizar
										</Menu.Item>
										<Menu.Item
											value={`delete-${poem.id}`}
											color='pink.100'
											_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
											onClick={() => onDeletePoem(poem.id)}
										>
											Deletar
										</Menu.Item>
									</Menu.Content>
								</Menu.Positioner>
							</Portal>
						</Menu.Root>
					</Flex>
				))}
			</Flex>
		</Surface>
	);
}
