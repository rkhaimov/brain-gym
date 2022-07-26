import { ChangesComponent } from './changes.component';
import { describe } from '../../../reusables/describe';
import { getByRole, userEvent } from '@storybook/testing-library';

const { exporting, it } = describe({
  title: 'Changes',
  component: ChangesComponent,
});

export default exporting;

export const Default = it({
  props: {
    name: 'It is my name',
    address: 'It is my address',
  },
});

export const Swapped = it({
  props: {
    name: 'It is my name',
    address: 'It is my address',
  },
  act: (context) => {
    const swap = getByRole(context.canvasElement, 'button', { name: 'Swap' });

    userEvent.click(swap);
  },
});
