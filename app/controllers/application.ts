import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import socketIO from "socket.io-client";

export default class ApplicationController extends Controller {
  queryParams = ['queryContext', 'pluginType'];

  @service('router')
  router;

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
  currentNode = null;

  @tracked
  totalBuildTime = 0;

  @tracked
  buildError = null;

  constructor() {
    super(...arguments);

    // In order for broccoli-inspector the middleware needs to be set and serving this asset
    // We can depend on socket.io being setup if that is the case
    const socket = socketIO(window.location.origin);

    socket.on("beginNode", this.beginNode.bind(this));
    socket.on("endNode", this.endNode.bind(this));
    socket.on("buildSuccess", this.buildSuccess.bind(this));
    socket.on("buildFailure", this.buildFailure.bind(this));
  }

  get currentRouteName() {
    return this.router.currentRouteName;
  }

  buildSuccess(currentBuild) {
    this.isBuilding = false;
    this.totalBuildTime = currentBuild.totalTime / 1000000;
  }

  buildFailure(currentBuild) {
    if (currentBuild.isBuilderError) {
      const { broccoliPayload } = currentBuild;
      const {
        originalError,
        nodeLabel,
        nodeId,
        error,
        fileContents,
      } = broccoliPayload;

      this.buildError = {
        fileContents,
        line: currentBuild?.broccoliPayload?.originalError?.hash.loc?.first_line || currentBuild?.broccoliPayload?.error?.location?.line,
        location: error.location.file,
        message: error.message,
        nodeId,
        nodeLabel,
      };
      console.log(this.buildError)
    }
  }

  endNode(data) {
    this.currentBuildTime = this.currentBuildTime + data.buildState.selfTime
  }

  beginNode(data) {
    // if we were previously not building we should reset the stats
    if (!this.isBuilding) {
      this.currentBuildTime = 0;
    }

    this.isBuilding = true;
    this.currentNode = data.label;
  }
}
