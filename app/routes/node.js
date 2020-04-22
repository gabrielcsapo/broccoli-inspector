import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import gql from "graphql-tag";
import { queryManager } from "ember-apollo-client";

const query = gql`
  query query($id: ID!) {
    node(id: $id) {
      id
      label
      inputFiles
      outputFiles
      pluginName
      buildState {
        selfTime
        totalTime
      }
      inputNodeWrappers {
        id
        label
        buildState {
          selfTime
          totalTime
        }
      }
      stats {
        fs {
          appendFile { count time }
          appendFileSync { count time }
          access { count time }
          accessSync { count time }
          chown { count time }
          chownSync { count time }
          chmod { count time }
          chmodSync { count time }
          close { count time }
          closeSync { count time }
          copyFile { count time }
          copyFileSync { count time }
          exists { count time }
          existsSync { count time }
          fchown { count time }
          fchownSync { count time }
          fchmod { count time }
          fchmodSync { count time }
          fdatasync { count time }
          fdatasyncSync { count time }
          fstat { count time }
          fstatSync { count time }
          fsync { count time }
          fsyncSync { count time }
          ftruncate { count time }
          ftruncateSync { count time }
          futimes { count time }
          futimesSync { count time }
          lchown { count time }
          lchownSync { count time }
          lchmod { count time }
          lchmodSync { count time }
          link { count time }
          linkSync { count time }
          lstat { count time }
          lstatSync { count time }
          mkdir { count time }
          mkdirSync { count time }
          mkdtemp { count time }
          mkdtempSync { count time }
          open { count time }
          openSync { count time }
          opendir { count time }
          opendirSync { count time }
          readdir { count time }
          readdirSync { count time }
          read { count time }
          readSync { count time }
          readFile { count time }
          readFileSync { count time }
          readlink { count time }
          readlinkSync { count time }
          realpath { count time }
          realpathSync { count time }
          rename { count time }
          renameSync { count time }
          rmdir { count time }
          rmdirSync { count time }
          stat { count time }
          statSync { count time }
          symlink { count time }
          symlinkSync { count time }
          truncate { count time }
          truncateSync { count time }
          unwatchFile { count time }
          unlink { count time }
          unlinkSync { count time }
          utimes { count time }
          utimesSync { count time }
          watch { count time }
          watchFile { count time }
          writeFile { count time }
          writeFileSync { count time }
          write { count time }
          writeSync { count time }
          writev { count time }
          writevSync { count time }
        }
      }
    }
  }
`;

export default class PluginsRoute extends Route {
  @queryManager apollo;

  constructor() {
    super(...arguments);
  }

  model(params) {
    const { id } = params;

    return this.apollo.query({ query, variables: { id } }, "node");
  }
}
