import { helper } from '@ember/component/helper';

function gt(args) {
  const [a, b] = args;

  return a > b;
}

export default helper(gt);
