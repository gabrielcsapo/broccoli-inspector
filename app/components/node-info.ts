import Component from "@glimmer/component";

interface Node {
  id: number;
  label: string;
  stats: Stats;
  outputFiles: string[];
  inputFiles: string[];
  buildState: {
    selfTime: number;
  };
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
  get fsTableHeader() {
    return [
      `Operation`,
      `Time`,
      `Count`
    ];
  }

  get fsTableBody() {
    const node = this.args.node;
    const fs = node?.stats?.fs || {};

    return Object.keys(fs)
      .filter((key) => {
        const item = fs[key];

        return item && item.time;
      })
      .map((key) => {
        const { time, count } = fs[key];
        // time is ns and we want to convert to ms
        return [key, `${time / 1000000}ms`, count];
      });
  }


  get fileTableHeader() {
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];

    return [
      `Output Files ${outputFiles.length}`,
      `Input Files ${inputFiles.length}`
    ]
  }

  get fileTableBody() {
    const table = [];
    const node = this.args.node;
    const inputFiles = node?.inputFiles || [];
    const outputFiles = node?.outputFiles || [];

    const tableHeight = Math.max(inputFiles.length, outputFiles.length);

    for (var i = 0; i < tableHeight; i++) {
      table.push([inputFiles[i], outputFiles[i]])
    }

    return table;
  }
}
