module.exports = {
  stories: ["../src/**/*.stories.ts"],
  // Empty array is important here
  addons: [],
  framework: "@storybook/angular",
  core: {
    builder: "@storybook/builder-webpack5",
  },
};
