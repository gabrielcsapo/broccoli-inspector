import Component from '@glimmer/component';

import PaperCard from 'ember-paper/components/paper-card';
import PaperIcon from 'ember-paper/components/paper-icon';

type Args = {
  title: string;
  subtitle: string;
  iconType: string;
};

export default class ErrorModal extends Component<Args> {
  <template>
    <PaperCard as |card|>
      <card.title as |title|>
        <title.text as |text|>
          <text.headline>{{@title}}</text.headline>
          <text.subhead>{{@subtitle}}</text.subhead>
        </title.text>
        <PaperIcon @icon={{@iconType}} />
      </card.title>
    </PaperCard>
  </template>
}
