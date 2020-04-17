import Component from "@glimmer/component";

interface Node {
  id: number;
  label: string;
  outputFiles: string[];
  inputFiles: string[];
  buildState: {
    selfTime: number;
  };
}

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  get fileTable() {
    const table = [];
    const node = this.args.node;
    const tableHeight = Math.max(node.inputFiles.length, node.outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      table.push([node.inputFiles[i], node.outputFiles[i]])
    }

    return table;
  }
}
