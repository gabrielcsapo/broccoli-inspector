import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

function highlightText(args) {
  const [text, query] = args;

  return htmlSafe(text.replace(new RegExp(query, 'gi'), "<mark>$&</mark>"));
}

export default helper(highlightText);
