import { helper } from '@ember/component/helper';

function eq(args) {
  const [a, b] = args;

  return a === b;
}

export default helper(eq);
