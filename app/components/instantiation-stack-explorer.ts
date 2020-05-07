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
    const fileReg = /at (.+?)\((\/+.*):(.+?):(.+?)(\)|$)/gm;
    console.log(this.args.instantiationStack)
    let instantiationStack = this.args.instantiationStack.replace(/<anonymous>/gm, function() {
      return encodeURI('&lt;anonymous&gt;');
    }).replace(fileReg, (match, func, filePath, line, column, endingCharacter, offset, string) => {
      return `<a data-file-path="${filePath}" data-line="${line}" data-column="${column}" href="#">at ${func}</a>`;
    }).replace(/at (\/+.*):(.+?):(.+?)$/gm, (match, filePath, line, column, endingCharacter, offset, string) => {
      return `<a data-file-path="${filePath}" data-line="${line}" data-column="${column}" href="#">at ${filePath}</a>`;
    });


    return instantiationStack.split('\n');
  }

  @action
  onStackClick(e) {
    e.stopPropagation();
    e.preventDefault();

    if(e.target && e.target.dataset['filePath']) {
      const { filePath, line, column } = e.target.dataset;

      this.selectedIndex = parseInt(e.target.parentNode.dataset['index']);
      this.loading = true;

      return this.apollo.query({ query, variables: { filePath } }, "file").then((result) => {
        this.file = result.value;
        this.line = line;
        this.column = column;
        this.filePath = filePath;
        this.loading = false;
      });
    }

    return false;
  }
}
