import { helper } from '@ember/component/helper';

function and(args) {
  const [a, b] = args;

  return a && b;
}

export default helper(and);
