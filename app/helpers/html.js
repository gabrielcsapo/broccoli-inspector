import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

function html(args) {
  const [a] = args;

  return htmlSafe(a);
}

export default helper(html);
