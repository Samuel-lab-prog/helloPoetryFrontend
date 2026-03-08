import { buttonRecipe } from './buttonRecipe';
import { cardSlotRecipe } from './cardSlotRecipe';
import { linkRecipe } from './linkRecipe';
import { textRecipe } from './textRecipe';

export const recipes = {
	button: buttonRecipe,
	link: linkRecipe,
	text: textRecipe,
};

export const slotRecipes = {
	card: cardSlotRecipe,
};
