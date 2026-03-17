import {
  Badge,
	Heading,
	Tabs,
	Text,
	VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { Surface } from '@root/core/base';

export function ActionsTab() {
	return (
		<Tabs.Content value='actions'>
			<Surface variant='panel'>
				<VStack align='start' gap={3}>
					<Heading as='h2' textStyle='h3'>
						Ações administrativas
					</Heading>
					<Text textStyle='body' color='pink.100'>
						Em breve: ferramentas de moderação mais amplas.
					</Text>
					<Wrap>
						<WrapItem>
							<Badge colorPalette='pink' variant='subtle'>
								Banir usuário
							</Badge>
						</WrapItem>
						<WrapItem>
							<Badge colorPalette='pink' variant='subtle'>
								Remover poema
							</Badge>
						</WrapItem>
					</Wrap>
				</VStack>
			</Surface>
		</Tabs.Content>
	);
}
