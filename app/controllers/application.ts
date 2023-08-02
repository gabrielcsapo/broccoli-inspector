import '@glint/environment-ember-loose';
import '@glint/environment-ember-template-imports';

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { io } from 'socket.io-client';
import type RouterService from '@ember/routing/router-service';
import { type Node } from 'broccoli-inspector/types';

type BuildError = {
  fileContents: string;
  line: number;
  location: string;
  message: string;
  nodeId: number;
  nodeLabel: string;
} | null;

export default class ApplicationController extends Controller {
  queryParams = ['queryContext', 'pluginType'];

  @service('router')
  declare router: RouterService;

  @tracked
  queryContext = null;

  @tracked
  pluginType = null;

  @tracked
  isLoading = false;

  @tracked
  isBuilding = false;

  @tracked
  currentBuildTime = 0;

  @tracked
  currentNode = ''; // label of the current node (TODO: we should change this name)

  @tracked
  totalBuildTime = 0;

  @tracked
  buildError: BuildError = null;

  constructor() {
    super(...arguments);

    // In order for broccoli-inspector the middleware needs to be set and serving this asset
    // We can depend on socket.io being setup if that is the case
    const socket = io(window.location.origin);

    socket.on('beginNode', this.beginNode.bind(this));
    socket.on('endNode', this.endNode.bind(this));
    socket.on('buildSuccess', this.buildSuccess.bind(this));
    socket.on('buildFailure', this.buildFailure.bind(this));
  }

  get currentRouteName() {
    return this.router.currentRouteName;
  }

  // TODO: figure out what the type is
  buildSuccess(currentBuild: any) {
    this.isBuilding = false;
    console.log(currentBuild);
    // TODO: this might be the wrong type
    this.totalBuildTime = (currentBuild as any).totalTime / 1000000;
  }

  // TODO: figure out what the type is
  buildFailure(currentBuild: any) {
    if (currentBuild.isBuilderError) {
      const { broccoliPayload } = currentBuild;
      const { originalError, nodeLabel, nodeId, error, fileContents } =
        broccoliPayload;

      this.buildError = {
        fileContents,
        line:
          originalError?.hash.loc?.first_line ||
          broccoliPayload?.error?.location?.line,
        location: error.location.file,
        message: error.message,
        nodeId,
        nodeLabel,
      };
      console.log(this.buildError);
    }
  }

  endNode(data: Node) {
    this.currentBuildTime = this.currentBuildTime + data.buildState.selfTime;
  }

  beginNode(data: Node) {
    // if we were previously not building we should reset the stats
    if (!this.isBuilding) {
      this.currentBuildTime = 0;
    }

    this.isBuilding = true;
    this.currentNode = data.label;
  }
}
