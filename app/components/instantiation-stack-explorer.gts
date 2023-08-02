import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { fn } from '@ember/helper';

import gql from 'graphql-tag';
// @ts-ignore
import { queryManager } from 'ember-apollo-client';

import eq from 'broccoli-inspector/helpers/eq';
import EmptyState from 'broccoli-inspector/components/empty-state';

import CodeBlock from 'ember-prism/components/code-block';

import PaperList from 'ember-paper/components/paper-list';
import PaperItem from 'ember-paper/components/paper-item';
import PaperContent from 'ember-paper/components/paper-content/component';
import PaperSidenav from 'ember-paper/components/paper-sidenav';
import PaperCard from 'ember-paper/components/paper-card';
import PaperSidenavContainer from 'ember-paper/components/paper-sidenav-container';
import PaperCardContent from 'ember-paper/components/paper-card-content';
import PaperProgressCircular from 'ember-paper/components/paper-progress-circular';
import PaperToolbar from 'ember-paper/components/paper-toolbar';
import PaperToolbarTools from 'ember-paper/components/paper-toolbar-tools';

type Args = {
  instantiationStack: string;
};

const query = gql`
  query query($filePath: String!) {
    file(filePath: $filePath) {
      value
    }
  }
`;

export default class InstantiationStackExplorer extends Component<Args> {
  @service
  declare router: RouterService;
  // @ts-ignore
  @queryManager apollo;

  @tracked selectedIndex = null;
  @tracked loading = false;
  @tracked file: string | null = null;
  @tracked line: number | null = null;
  @tracked column: number | null = null;
  @tracked filePath: string | null = null;

  get instantiationStack() {
    const fileReg = /at (.+?)\((\/+.*):(.+?):(.+?)(\)|$)/m;

    const { instantiationStack } = this.args;

    return instantiationStack.split('\n').map((stackLine) => {
      if (fileReg.exec(stackLine) !== null) {
        const match = fileReg.exec(stackLine);

        if (match) {
          return {
            stackLine: `at ${match[1]}`,
            filePath: match[2],
            line: match[3],
            column: match[4],
          };
        }
      }

      if (/at (\/+.*):(.+?):(.+?)$/m.exec(stackLine) !== null) {
        const match = /at (\/+.*):(.+?):(.+?)$/gm.exec(stackLine);

        if (match) {
          return {
            stackLine: `at ${match[1]}`,
            filePath: match[1],
            line: match[2],
            column: match[3],
          };
        }
      }

      return {
        stackLine,
      };
    });
  }

  @action
  onStackClick(filePath: string, line: number, column: number) {
    this.loading = true;

    return this.apollo
      .query({ query, variables: { filePath } }, 'file')
      .then((result: any) => {
        this.file = result.value;
        this.line = line;
        this.column = column;
        this.filePath = filePath;
        this.loading = false;

        setTimeout(function () {
          document?.querySelector('.code-block')?.scroll(
            0,
            parseInt(
              document
                ?.querySelector('.line-highlight')
                // @ts-ignore
                ?.style.top.replace('px', '')
            )
          );
        }, 200);
      });
  }

  <template>
    <PaperCard as |card|>
      <card.content @class="p-0">
        <PaperSidenavContainer>
          <PaperCardContent @class="flex p-0">
            {{#if this.loading}}
              <PaperCard as |card|>
                <card.title as |title|>
                  <title.text as |text|>
                    <text.headline>Currently loading file</text.headline>
                    <text.subhead>Please do not refresh, this page will refresh
                      when data is loaded</text.subhead>
                  </title.text>
                  <PaperProgressCircular
                    @accent={{true}}
                    @class="md-hue-1"
                    @diameter={{60}}
                  />
                </card.title>
              </PaperCard>
            {{else}}
              {{#if this.file}}
                <div style="height:400px;">
                  <PaperToolbar>
                    <PaperToolbarTools>
                      {{this.filePath}}
                      {{this.line}}:{{this.column}}
                    </PaperToolbarTools>
                  </PaperToolbar>

                  <CodeBlock
                    style="overflow:scroll;height:100%;"
                    class="line-numbers mb-0 mt-0"
                    @code={{this.file}}
                    @language="javascript"
                    data-line={{this.line}}
                  />
                </div>
              {{else}}
                <EmptyState
                  @iconType="code"
                  @title="Click stack line on the right to see file"
                />
              {{/if}}
            {{/if}}
          </PaperCardContent>

          <PaperSidenav @class="md-whiteframe-z2" @lockedOpen={{true}}>
            <PaperContent>
              <PaperList style="height:400px;">
                {{#each
                  this.instantiationStack
                  as |instantiationStackLine index|
                }}
                  {{#if instantiationStackLine.filePath}}
                    <PaperItem
                      @onClick={{fn
                        this.onStackClick
                        instantiationStackLine.filePath
                        instantiationStackLine.line
                        instantiationStackLine.column
                      }}
                      @class={{if (eq this.selectedIndex index) "active"}}
                    >
                      {{instantiationStackLine.stackLine}}
                    </PaperItem>
                  {{else}}
                    <PaperItem
                      @class={{if (eq this.selectedIndex index) "active"}}
                    >
                      {{instantiationStackLine.stackLine}}
                    </PaperItem>
                  {{/if}}
                {{/each}}
              </PaperList>
            </PaperContent>
          </PaperSidenav>
        </PaperSidenavContainer>
      </card.content>
    </PaperCard>
  </template>
}
