import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import type RouterService from "@ember/routing/router-service";

import gql from "graphql-tag";
// @ts-ignore
import { queryManager } from "ember-apollo-client";

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

    return instantiationStack.split("\n").map((stackLine) => {
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
      .query({ query, variables: { filePath } }, "file")
      .then((result: any) => {
        this.file = result.value;
        this.line = line;
        this.column = column;
        this.filePath = filePath;
        this.loading = false;

        setTimeout(function () {
          document?.querySelector(".code-block")?.scroll(
            0,
            parseInt(
              document
                ?.querySelector(".line-highlight")
                // @ts-ignore
                ?.style.top.replace("px", "")
            )
          );
        }, 200);
      });
  }
}
