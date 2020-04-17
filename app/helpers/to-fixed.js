import { helper } from '@ember/component/helper';

function toFixed(args) {
  let [number, to] = args;
  return Number(number).toFixed(to);
}

export default helper(toFixed);
