import compact from './compact';

/**
 * Converts a input string into an array of 1ch long keys (Path).
 * @param {string} input - The input string to process.
 * @returns {Path} The processed array of string segments 1ch long.
 * @example
 * stringToPath('a.b.c');      // Output: ['a', 'b', 'c']
 * stringToPath('["a.b[c]"]'); // Output: ['a', 'b', 'c']
 * stringToPath('a[0].b["c"]') // Output: ['a', '0', 'b', 'c']
 */
export default function stringToPath(input: string): string[] {
  // Input: a["b"]['c'].d[0] -> Output: 'a[b[c.d[0'
  const removeQuotesAndBrackets = /["|']|\]/g;
  // Input: 'a[b[c.d[0' -> ['a', 'b', 'c', 'd', '0']
  const splitOnDotOrOpenBracket = /\.|\[/;
  return compact(
    input.replace(removeQuotesAndBrackets, '').split(splitOnDotOrOpenBracket),
  );
}
