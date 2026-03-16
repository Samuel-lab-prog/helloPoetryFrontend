import {
	Badge,
	Button,
	Flex,
	Heading,
	Text,
	VStack,
} from '@chakra-ui/react';
import { Surface } from '@features/base';

export function UnauthorizedPage({ onBack }: { onBack: () => void }) {
  return (
    <Flex as='main' layerStyle='main' direction='column' align='center' justify='center'>
      <Surface variant='gradient' maxW='2xl' w='full'>
        <VStack align='start' gap={3}>
          <Badge colorPalette='pink' variant='subtle'>
            Moderação
          </Badge>
          <Heading as='h1' textStyle='h2'>
            Acesso restrito
          </Heading>
          <Text textStyle='body' color='pink.100'>
            Esta página é exclusiva para moderadores e administradores.
          </Text>
          <Button size='sm' variant='solidPink' onClick={onBack}>
            Voltar
          </Button>
        </VStack>
      </Surface>
    </Flex>
  );
}
