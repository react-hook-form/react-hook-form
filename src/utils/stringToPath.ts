export default (string: string): string[] => {
  const result: string[] = [];

  string.replace(
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    (match: string, number: string, quote: string, string: string): any => {
      result.push(quote ? string.replace(/\\(\\)?/g, '$1') : number || match);
    },
  );

  return result;
};
