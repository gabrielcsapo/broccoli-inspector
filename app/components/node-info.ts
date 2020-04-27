import Component from "@glimmer/component";

interface Node {
  id: number;
  label: string;
  stats: Stats;
  nodeInfo: NodeInfo;
  outputFiles: string[];
  inputFiles: string[];
  inputNodeWrappers: Node[];
  buildState: {
    selfTime: number;
  };
}

interface NodeInfo {
  instantiationStack: String;
  annotation: String;
  persistentOutput: Boolean;
  needsCache: Boolean;
  volatile: Boolean;
  trackInputChanges: Boolean;
}

interface Stats {
  fs?: FS
}

interface FS {
  appendFile?: FSMetric
  appendFileSync?: FSMetric
  access?: FSMetric
  accessSync?: FSMetric
  chown?: FSMetric
  chownSync?: FSMetric
  chmod?: FSMetric
  chmodSync?: FSMetric
  close?: FSMetric
  closeSync?: FSMetric
  copyFile?: FSMetric
  copyFileSync?: FSMetric
  exists?: FSMetric
  existsSync?: FSMetric
  fchown?: FSMetric
  fchownSync?: FSMetric
  fchmod?: FSMetric
  fchmodSync?: FSMetric
  fdatasync?: FSMetric
  fdatasyncSync?: FSMetric
  fstat?: FSMetric
  fstatSync?: FSMetric
  fsync?: FSMetric
  fsyncSync?: FSMetric
  ftruncate?: FSMetric
  ftruncateSync?: FSMetric
  futimes?: FSMetric
  futimesSync?: FSMetric
  lchown?: FSMetric
  lchownSync?: FSMetric
  lchmod?: FSMetric
  lchmodSync?: FSMetric
  link?: FSMetric
  linkSync?: FSMetric
  lstat?: FSMetric
  lstatSync?: FSMetric
  mkdir?: FSMetric
  mkdirSync?: FSMetric
  mkdtemp?: FSMetric
  mkdtempSync?: FSMetric
  open?: FSMetric
  openSync?: FSMetric
  opendir?: FSMetric
  opendirSync?: FSMetric
  readdir?: FSMetric
  readdirSync?: FSMetric
  read?: FSMetric
  readSync?: FSMetric
  readFile?: FSMetric
  readFileSync?: FSMetric
  readlink?: FSMetric
  readlinkSync?: FSMetric
  realpath?: FSMetric
  realpathSync?: FSMetric
  rename?: FSMetric
  renameSync?: FSMetric
  rmdir?: FSMetric
  rmdirSync?: FSMetric
  stat?: FSMetric
  statSync?: FSMetric
  symlink?: FSMetric
  symlinkSync?: FSMetric
  truncate?: FSMetric
  truncateSync?: FSMetric
  unwatchFile?: FSMetric
  unlink?: FSMetric
  unlinkSync?: FSMetric
  utimes?: FSMetric
  utimesSync?: FSMetric
  watch?: FSMetric
  watchFile?: FSMetric
  writeFile?: FSMetric
  writeFileSync?: FSMetric
  write?: FSMetric
  writeSync?: FSMetric
  writev?: FSMetric
  writevSync?: FSMetric
}

interface FSMetric {
  count?: number
  time?: number
}

interface Args {
  node?: Node;
}

export default class NodeInfo extends Component<Args> {
  get info() {
    const node = this.args.node;
    const nodeInfo = node?.nodeInfo || {};

    return {
      header: [
        "Property", "Value"
      ],
      body: Object.keys(nodeInfo)
        .filter((prop) => prop.indexOf('__') === -1)
        .map((prop) => {
          if(prop === 'instantiationStack') {
            return [prop, {
              tag: 'pre',
              text: nodeInfo[prop]
            }]
          }

          return [prop, nodeInfo[prop]]
        })
    }
  }

  get inputNodeWrappers() {
    const node = this.args.node;
    const inputNodeWrappers = node?.inputNodeWrappers || [];

    return {
      header: [
        'ID',
        'Time',
        'Node Label'
      ],
      body: inputNodeWrappers.map((inputNodeWrapper) => {
        return [
          inputNodeWrapper.id,
          Number(inputNodeWrapper.buildState.selfTime).toFixed(3) + 'ms',
          {
            text: inputNodeWrapper.label,
            linkModel: inputNodeWrapper.id,
            linkRoute: 'node'
          }
        ]
      })
    }
  }

  get fs() {
    const node = this.args.node;
    const fs = node?.stats?.fs || {};

    const body = Object.keys(fs)
      .filter((key) => {
        const item = fs[key];

        return item && item.time;
      })
      .sort((keyA, keyB) => {
        const rowA = fs[keyA];
        const rowB = fs[keyB];

        return rowB.time - rowA.time;
      })
      .map((key) => {
        const { time, count } = fs[key];
        // time is ns and we want to convert to ms
        return [key, `${time / 1000000}ms`, count];
      });

    return {
      header: [
        `Operation`,
        `Time`,
        `Count`
      ],
      body
    }
  }

  get files() {
    const body = [];
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];
    const tableHeight = Math.max(inputFiles.length, outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      body.push([inputFiles[i], outputFiles[i]])
    }

    return {
      header: [
        `Input Files (${inputFiles.length})`,
        `Output Files (${outputFiles.length})`
      ],
      body
    };
  }
}
