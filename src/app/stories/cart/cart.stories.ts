import { describe } from '../../reusables/describe';
import { CartComponent } from './cart.component';
import { moduleMetadata } from '@storybook/angular';
import { arrangeCartService, CartService } from '../../globals/cart.service';
import { createMockApi } from '../../externals';
import { config } from './pure-config';
import { getByRole, userEvent } from '@storybook/testing-library';

const { exporting, it } = describe({
  title: 'Cart',
  component: CartComponent,
  decorators: [moduleMetadata(config)],
});

export default exporting;

export const Empty = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
});

export const WithProducts = it({
  moduleMetadata: {
    providers: [
      arrangeCartService(
        (cart: CartService) =>
          cart.add({
            id: 1,
            name: 'Phone XL',
            price: 1_000,
            description: 'A large phone with one of the best screens',
          }),
        { api: createMockApi() }
      ),
      createMockApi(),
    ],
  },
});

export const FormTyped = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
  act: (context) => {
    userEvent.type(
      getByRole(context.canvasElement, 'textbox', { name: 'Name' }),
      'Roman'
    );

    userEvent.type(
      getByRole(context.canvasElement, 'textbox', { name: 'Address' }),
      'Earth'
    );
  },
});

export const FormTypedReordered = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
  act: (context) => {
    userEvent.type(
      getByRole(context.canvasElement, 'textbox', { name: 'Name' }),
      'Roman'
    );

    userEvent.type(
      getByRole(context.canvasElement, 'textbox', { name: 'Address' }),
      'Earth'
    );

    userEvent.click(
      getByRole(context.canvasElement, 'button', { name: 'Reorder' })
    );
  },
});

export const FontIncrease = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
  act: (context) => {
    userEvent.click(getByRole(context.canvasElement, 'button', { name: '+' }));
  },
});

export const FontDecrease = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
  act: (context) => {
    userEvent.click(getByRole(context.canvasElement, 'button', { name: '-' }));
  },
});

export const IfSwapped = it({
  moduleMetadata: {
    providers: [CartService, createMockApi()],
  },
  act: (context) => {
    userEvent.click(
      getByRole(context.canvasElement, 'button', { name: 'Swap!' })
    );
  },
});
