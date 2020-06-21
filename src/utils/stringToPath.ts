export default (input: string): (string | number)[] => {
  const result: (string | number)[] = [];

  input.replace(
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
    (
      match: string,
      mathNumber: string,
      mathQuote: string,
      originalString: string,
    ): any => {
      result.push(
        mathQuote
          ? originalString.replace(/\\(\\)?/g, '$1')
          : Number(mathNumber) || match,
      );
    },
  );

  return result;
};
