import { Meta, Story } from '@storybook/angular';
import { getByRole, userEvent } from '@storybook/testing-library';
import { ChangesComponent } from './changes.component';

export default { title: 'Changes', component: ChangesComponent } as Meta;

export const Example: Story = (args, context) => {
  console.log(args, context);

  return {
    props: {
      name: 'It is my name',
      address: 'It is my address',
    },
  };
};

Example.play = (context) => {
  const swap = getByRole(context.canvasElement, 'button', { name: 'Swap' });

  setTimeout(() => userEvent.click(swap), 5_000);
};
