import { helper } from '@ember/component/helper';

function or(args) {
  const [a, b] = args;

  return a || b;
}

export default helper(or);
