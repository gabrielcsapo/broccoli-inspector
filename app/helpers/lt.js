import { helper } from '@ember/component/helper';

function lt(args) {
  const [a, b] = args;

  return a < b;
}

export default helper(lt);
