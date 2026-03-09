import { Avatar, Flex, Heading, HStack, IconButton, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Surface } from '@features/base';
import type { FriendRequestsSectionProps } from './types';

export function FriendRequestsSection({
	friendRequests,
	isFriendRequestsLoading,
	isFriendRequestsError,
	isAccepting,
	isRejecting,
	errorMessage,
	onAcceptRequest,
	onRejectRequest,
}: FriendRequestsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Heading as='h2' textStyle='h4' mb={4} color='pink.300'>
				Solicitacoes de amizade recebidas
			</Heading>

			<Flex direction='column' gap={3}>
				{isFriendRequestsLoading && <Text textStyle='small'>Carregando solicitacoes...</Text>}
				{!isFriendRequestsLoading && !isFriendRequestsError && friendRequests.received.length === 0 && (
					<Text textStyle='small'>Nenhuma solicitacao pendente.</Text>
				)}
				{isFriendRequestsError && <Text textStyle='small' color='red.400'>Erro ao carregar solicitacoes.</Text>}

				{friendRequests.received.map((request) => (
					<Flex
						key={request.requesterId}
						align={{ base: 'start', md: 'center' }}
						justify='space-between'
						direction={{ base: 'column', md: 'row' }}
						gap={3}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
					>
						<HStack gap={3}>
							<Avatar.Root size='sm'>
								<Avatar.Image src={request.requesterAvatarUrl ?? undefined} />
								<Avatar.Fallback name={request.requesterNickname} />
							</Avatar.Root>
							<Link
								asChild
								textStyle='small'
								color='pink.200'
								fontWeight='semibold'
								textDecoration='underline'
								textUnderlineOffset='3px'
								_hover={{ color: 'pink.100' }}
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'pink.300',
									outlineOffset: '2px',
								}}
							>
								<NavLink to={`/authors/${request.requesterId}`}>@{request.requesterNickname}</NavLink>
							</Link>
						</HStack>
						<Flex gap={2}>
							<IconButton
								aria-label='Aceitar solicitacao'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								onClick={() => onAcceptRequest(request.requesterId)}
								loading={isAccepting}
							>
								<Check />
							</IconButton>
							<IconButton
								aria-label='Recusar solicitacao'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								colorPalette='gray'
								onClick={() => onRejectRequest(request.requesterId)}
								loading={isRejecting}
							>
								<X />
							</IconButton>
						</Flex>
					</Flex>
				))}
			</Flex>

			{errorMessage && (
				<Text mt={3} textStyle='small' color='red.400'>
					{errorMessage}
				</Text>
			)}
		</Surface>
	);
}
