import type { InternalFieldName } from '../types';

export default (names: Set<InternalFieldName>, name: InternalFieldName) => {
  const parts = name.split('.');
  const matches: string[] = [];
  let prefix = parts[0];

  for (let i = 1; i < parts.length; prefix += '.' + parts[i++]) {
    !isNaN(+parts[i]) && names.has(prefix) && matches.push(prefix);
  }

  return matches;
};
