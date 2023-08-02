import Component from '@glimmer/component';

import CodeBlock from 'ember-prism/components/code-block';

import PaperDialog from 'ember-paper/components/paper-dialog';
import PaperDialogContent from 'ember-paper/components/paper-dialog-content';
import PaperCard from 'ember-paper/components/paper-card';
import HrefTo from 'ember-href-to/helpers/href-to';

type Args = {
  error: {
    location: string;
    line: string;
    errorId: string;
    nodeId: string;
    fileContents: string;
    nodeLabel: string;
    message: string;
  };
};

export default class ErrorModal extends Component<Args> {
  constructor(...args: any) {
    // @ts-ignore
    super(...args);
  }

  scrollToError() {
    document.querySelector('.error-message-block')?.scroll(
      0,
      parseInt(
        // @ts-ignore
        document.querySelector('.line-highlight').style.top.replace('px', '')
      )
    );
  }

  <template>
    <div {{did-insert (action this.scrollToError)}}>
      <PaperDialog @class="flex">
        <PaperDialogContent @class="p-0">
          <div class="m-0">
            <PaperCard @class="m-0" as |card|>
              <card.title as |title|>
                <title.text as |text|>
                  <text.headline>Error!</text.headline>
                  <text.subhead>{{@error.location}}
                    on line
                    {{@error.line}}
                    in
                    <a
                      href={{HrefTo "node" @error.nodeId}}
                    >{{@error.nodeLabel}}</a></text.subhead>
                </title.text>
              </card.title>
              <pre class="m-0"><code>{{@error.message}}</code></pre>
              <card.content @class="m-0 p-0">
                <CodeBlock
                  class="error-message-block line-numbers mb-0 mt-0"
                  style="height:200px;"
                  @code={{@error.fileContents}}
                  data-line={{@error.line}}
                />
              </card.content>
            </PaperCard>
          </div>
        </PaperDialogContent>
      </PaperDialog>
    </div>
  </template>
}
