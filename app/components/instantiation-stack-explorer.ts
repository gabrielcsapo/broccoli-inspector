import Component from "@glimmer/component";
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($filePath: String!) {
    file(filePath: $filePath) {
      value
    }
  }
`;

export default class InstantiationStackExplorer extends Component {
  @service router;
  @queryManager apollo;

  @tracked selectedIndex = null;
  @tracked loading = false;
  @tracked file = null;
  @tracked line = null;
  @tracked column = null;
  @tracked filePath = null;

  get instantiationStack() {
    const fileReg = /at (.+?)\((\/+.*):(.+?):(.+?)(\)|$)/m;

    const { instantiationStack } = this.args

    return instantiationStack.split('\n').map((stackLine) => {
      if(fileReg.exec(stackLine) !== null) {
        const match = fileReg.exec(stackLine);

        return {
          stackLine: `at ${match[1]}`,
          filePath: match[2],
          line: match[3],
          column: match[4]
        }
      }

      if(/at (\/+.*):(.+?):(.+?)$/m.exec(stackLine) !== null) {
        const match = /at (\/+.*):(.+?):(.+?)$/gm.exec(stackLine);

        return {
          stackLine: `at ${match[1]}`,
          filePath: match[1],
          line: match[2],
          column: match[3]
        }
      }

      return {
        stackLine
      }
    });
  }

  @action
  onStackClick(filePath, line, column) {
    this.loading = true;

    return this.apollo.query({ query, variables: { filePath } }, "file").then((result) => {
      this.file = result.value;
      this.line = line;
      this.column = column;
      this.filePath = filePath;
      this.loading = false;

      setTimeout(function() {
        document.querySelector('.code-block').scroll(0, parseInt(document.querySelector('.line-highlight').style.top.replace('px', '')))
      }, 200)
    });
  }
}
