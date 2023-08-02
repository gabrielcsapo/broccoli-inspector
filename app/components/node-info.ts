import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { Node } from "broccoli-inspector/types";
import type RouterService from "@ember/routing/router-service";

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  @service
  declare router: RouterService;

  @tracked
  selectedHeimdallCustomSchemaIndex = 0;

  get selectedHeimdallCustomSchema() {
    return (this.args.node as any).stats.custom[
      this.selectedHeimdallCustomSchemaIndex
    ];
  }

  get info() {
    const node = this.args.node;
    const nodeInfo = node?.nodeInfo || {};

    const body = Object.keys(nodeInfo)
      .filter(
        (prop) => prop.indexOf("__") === -1 && prop !== "instantiationStack"
      )
      .map((prop) => [prop, (nodeInfo as any)[prop]]);

    if (node?.pluginName) {
      body.push(["pluginName", node.pluginName]);
    }

    return {
      header: ["Property", "Value"],
      body,
    };
  }

  @action
  onInfoTableClick(e: any) {
    e.stopPropagation();
    e.preventDefault();

    if (e.target && e.target.dataset["filePath"]) {
      const { filePath, line, column } = e.target.dataset;

      if (this.args?.node?.id) {
        this.router.transitionTo("node.file", this.args?.node?.id, {
          queryParams: { filePath: encodeURI(filePath), line, column },
        });
      } else {
        alert("selected node has no id");
      }
    }

    return false;
  }

  get inputNodeWrappers() {
    const node = this.args.node;
    const inputNodeWrappers = node?.inputNodeWrappers || [];

    return {
      header: ["ID", "Time", "Node Label"],
      body: inputNodeWrappers.map((inputNodeWrapper) => {
        return [
          inputNodeWrapper.id,
          Number(inputNodeWrapper.buildState.selfTime).toFixed(3) + "ms",
          {
            text: inputNodeWrapper.label,
            linkModel: inputNodeWrapper.id,
            linkRoute: "node",
          },
        ];
      }),
    };
  }

  get outputNodeWrappers() {
    const node = this.args.node;
    const outputNodeWrappers = node?.outputNodeWrappers || [];

    return {
      header: ["ID", "Time", "Node Label"],
      body: outputNodeWrappers.map((outputNodeWrapper) => {
        return [
          outputNodeWrapper.id,
          Number(outputNodeWrapper.buildState.selfTime).toFixed(3) + "ms",
          {
            text: outputNodeWrapper.label,
            linkModel: outputNodeWrapper.id,
            linkRoute: "node",
          },
        ];
      }),
    };
  }

  get files() {
    const body = [];
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];
    const tableHeight = Math.max(inputFiles.length, outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      body.push([inputFiles[i], outputFiles[i]]);
    }

    return {
      header: [
        `Input Files (${inputFiles.length})`,
        `Output Files (${outputFiles.length})`,
      ],
      body,
    };
  }
}
