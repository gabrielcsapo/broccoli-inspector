import { helper } from '@ember/component/helper';

function nodeTotalTime(args) {
  const [nodes] = args;

  return nodes.map((node) => node.buildState.selfTime).reduce((a, b) => a + b);
}

export default helper(nodeTotalTime);
