import { hbs } from 'ember-cli-htmlbars';
import { linkTo } from '@storybook/addon-links';

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
