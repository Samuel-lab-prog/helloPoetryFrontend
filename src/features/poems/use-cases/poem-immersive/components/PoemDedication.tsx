import { Box, Link, Text } from '@chakra-ui/react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { type DedicationUser } from '../utils/types';

interface PoemDedicationProps {
	dedicationUsers: DedicationUser[];
}

export function PoemDedication({ dedicationUsers }: PoemDedicationProps) {
	if (dedicationUsers.length === 0) return null;

	return (
		<Box
			position='absolute'
			bottom={{ base: 4, md: 5 }}
			right={{ base: 4, md: 6 }}
			textAlign='right'
			color='purple.200'
			opacity={0.9}
			pointerEvents='auto'
		>
			<Text textStyle='smaller' letterSpacing='0.12em' textTransform='uppercase' color='purple.200'>
				Dedicated to
			</Text>
			<Text textStyle='body' fontSize={{ base: '0.95rem', md: '1rem' }} color='pink.200'>
				{dedicationUsers.map((user, index) => {
					const label = user.nickname ? `@${user.nickname}` : user.name;
					return (
						<React.Fragment key={user.id}>
							<Link
								asChild
								color='pink.200'
								textDecoration='underline'
								textDecorationThickness='1px'
								textUnderlineOffset='3px'
								_hover={{ color: 'pink.50' }}
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'pink.200',
									outlineOffset: '2px',
								}}
								cursor='pointer'
							>
								<NavLink to={`/authors/${user.id}`}>{label}</NavLink>
							</Link>
							{index < dedicationUsers.length - 1 && (
								<Text as='span' color='pink.200'>
									,{' '}
								</Text>
							)}
						</React.Fragment>
					);
				})}
			</Text>
		</Box>
	);
}
