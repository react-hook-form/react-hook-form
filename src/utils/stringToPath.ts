import { REGEX_ESCAPE_CHAR, REGEX_PROP_NAME } from '../constants';

export default (string: string): string[] => {
  const result: string[] = [];

  string.replace(
    REGEX_PROP_NAME,
    (match: string, number: string, quote: string, string: string): any => {
      result.push(
        quote ? string.replace(REGEX_ESCAPE_CHAR, '$1') : number || match,
      );
    },
  );

  return result;
};
