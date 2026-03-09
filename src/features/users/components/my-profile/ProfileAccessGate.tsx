import { Badge, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@features/base';

export function ProfileAccessGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 6, md: 8 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Perfil
				</Badge>
				<Text textStyle='h2'>Entre para ver seu perfil</Text>
				<Text textStyle='body' color='pink.100'>
					Acompanhe poemas salvos, pedidos de amizade e suas estatisticas em um unico lugar.
				</Text>
				<HStack gap={3} wrap='wrap'>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
						<NavLink to='/login'>Entrar</NavLink>
					</Button>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/register'>Criar conta</NavLink>
					</Button>
				</HStack>
			</VStack>
		</Surface>
	);
}
