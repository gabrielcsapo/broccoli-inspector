import { helper } from '@ember/component/helper';

function nodeByTypeTotalTime(args) {
  const [nodes] = args;

  return nodes.map((node) => node.time).reduce((a, b) => a + b);
}

export default helper(nodeByTypeTotalTime);
