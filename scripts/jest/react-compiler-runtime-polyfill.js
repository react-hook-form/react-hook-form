/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');

const $empty = Symbol.for('react.memo_cache_sentinel');

module.exports.c = function c(size) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return React.useState(() => {
    const $ = new Array(size);
    for (let ii = 0; ii < size; ii++) {
      $[ii] = $empty;
    }
    // This symbol is added to tell the React DevTools that this array is from
    // useMemoCache.
    $[$empty] = true;
    return $;
  })[0];
};
