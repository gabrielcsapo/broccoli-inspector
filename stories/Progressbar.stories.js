import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'Progressbar',
};

export const ToStorybook = () => ({
  template: hbs`
    <Progressbar />
  `,
});

ToStorybook.story = {
  name: 'Base',
};
