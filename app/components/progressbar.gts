import Component from '@glimmer/component';

import PaperToolbar from 'ember-paper/components/paper-toolbar';
import PaperToolbarTools from 'ember-paper/components/paper-toolbar-tools';

type Args = {
  isBuilding: boolean;
  currentBuildTime: string;
  currentStep: string;
};

export default class ProgressBar extends Component<Args> {
  <template>
    {{#if @isBuilding}}
      <PaperToolbar @accent={{true}}>
        <PaperToolbarTools>
          ({{@currentBuildTime}}ms)
          {{@currentStep}}
        </PaperToolbarTools>
      </PaperToolbar>
    {{/if}}
  </template>
}
