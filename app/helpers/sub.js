import { helper } from '@ember/component/helper';

function sub(args) {
  const [a, b] = args;

  return a - b;
}

export default helper(sub);
