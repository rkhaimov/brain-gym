import { Meta, Story } from '@storybook/angular';

type StoryConfig<TProps extends Record<string, unknown>> = ReturnType<Story> & {
  props?: TProps;
  act?: NonNullable<Story['play']>;
};

type Component = new (...args: any) => any;

type StoriesConfig<TComponent> = {
  title: string;
  component: TComponent;
  decorators?: Meta['decorators'];
};

export function describe<TComponent extends Component>(
  config: StoriesConfig<TComponent>
) {
  return {
    exporting: config,
    it: (config: StoryConfig<Partial<InstanceType<TComponent>>>): Story => {
      const story: Story = () => config;

      story.play = config.act;

      return story;
    },
  };
}
