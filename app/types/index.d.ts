export interface Node {
  id: number;
  pluginName: string;
  label: string;
  stats: Stats;
  nodeInfo: NodeInfo;
  outputFiles: string[];
  inputFiles: string[];
  inputNodeWrappers: Node[];
  outputNodeWrappers: Node[];
  buildState: {
    selfTime: number;
  };
}

export interface SystemInfo {
  totalmem: number;
  type: string;
  cpus: number;
  env: string;
}

export interface NodeInfo {
  instantiationStack: string;
  annotation: string;
  persistentOutput: Boolean;
  needsCache: Boolean;
  volatile: Boolean;
  trackInputChanges: Boolean;
}

export interface Stats {
  fs?: FS;
  custom?: CustomStat;
}

export interface NodesByType {
  label: string;
  time: number;
  amountOfNodes: number;
  nodes: Node[];
}

export interface CustomStat {
  name?: string;
  jsonValue?: string;
}

export interface FS {
  appendFile?: FSMetric;
  appendFileSync?: FSMetric;
  access?: FSMetric;
  accessSync?: FSMetric;
  chown?: FSMetric;
  chownSync?: FSMetric;
  chmod?: FSMetric;
  chmodSync?: FSMetric;
  close?: FSMetric;
  closeSync?: FSMetric;
  copyFile?: FSMetric;
  copyFileSync?: FSMetric;
  exists?: FSMetric;
  existsSync?: FSMetric;
  fchown?: FSMetric;
  fchownSync?: FSMetric;
  fchmod?: FSMetric;
  fchmodSync?: FSMetric;
  fdatasync?: FSMetric;
  fdatasyncSync?: FSMetric;
  fstat?: FSMetric;
  fstatSync?: FSMetric;
  fsync?: FSMetric;
  fsyncSync?: FSMetric;
  ftruncate?: FSMetric;
  ftruncateSync?: FSMetric;
  futimes?: FSMetric;
  futimesSync?: FSMetric;
  lchown?: FSMetric;
  lchownSync?: FSMetric;
  lchmod?: FSMetric;
  lchmodSync?: FSMetric;
  link?: FSMetric;
  linkSync?: FSMetric;
  lstat?: FSMetric;
  lstatSync?: FSMetric;
  mkdir?: FSMetric;
  mkdirSync?: FSMetric;
  mkdtemp?: FSMetric;
  mkdtempSync?: FSMetric;
  open?: FSMetric;
  openSync?: FSMetric;
  opendir?: FSMetric;
  opendirSync?: FSMetric;
  readdir?: FSMetric;
  readdirSync?: FSMetric;
  read?: FSMetric;
  readSync?: FSMetric;
  readFile?: FSMetric;
  readFileSync?: FSMetric;
  readlink?: FSMetric;
  readlinkSync?: FSMetric;
  realpath?: FSMetric;
  realpathSync?: FSMetric;
  rename?: FSMetric;
  renameSync?: FSMetric;
  rmdir?: FSMetric;
  rmdirSync?: FSMetric;
  stat?: FSMetric;
  statSync?: FSMetric;
  symlink?: FSMetric;
  symlinkSync?: FSMetric;
  truncate?: FSMetric;
  truncateSync?: FSMetric;
  unwatchFile?: FSMetric;
  unlink?: FSMetric;
  unlinkSync?: FSMetric;
  utimes?: FSMetric;
  utimesSync?: FSMetric;
  watch?: FSMetric;
  watchFile?: FSMetric;
  writeFile?: FSMetric;
  writeFileSync?: FSMetric;
  write?: FSMetric;
  writeSync?: FSMetric;
  writev?: FSMetric;
  writevSync?: FSMetric;
}

export interface FSMetric {
  count?: number;
  time?: number;
}
