/* global document */

/**
 * Shamelessly ripped from jQuery's HTML parser
 */

// TODO: unit test this
const parseHTML = (elem, context = document) => {
  const rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi;
  const rtagName = /<([\w:]+)/;
  const rhtml = /<|&#?\w+;/;
  const wrapMap = {
    option: [1, '<select multiple=\'multiple\'>', '</select>'],
    thead: [1, '<table>', '</table>'],
    col: [2, '<table><colgroup>', '</colgroup></table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    default: [0, '', ''],
  };
  const fragment = context.createDocumentFragment();

  let tmp;
  let tag;
  let wrap;
  let j;

  if (!rhtml.test(elem)) {
    fragment.appendChild(context.createTextNode(elem));
  } else {
    tmp = fragment.appendChild(context.createElement('div'));
    tag = (rtagName.exec(elem) || [', '])[1].toLowerCase();
    wrap = wrapMap[tag] || wrapMap.default;
    tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, '<$1></$2>') + wrap[2];

    j = wrap[0];
    while (j) {
      tmp = tmp.lastChild;
      j -= 1;
    }

    fragment.removeChild(fragment.firstChild);
    while (tmp.firstChild) {
      fragment.appendChild(tmp.firstChild);
    }
  }

  return fragment;
};

export default parseHTML;
