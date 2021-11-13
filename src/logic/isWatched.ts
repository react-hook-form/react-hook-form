import { InternalFieldName, Names } from '../types';

export default (
  name: InternalFieldName,
  _names: Names,
  isBlurEvent?: boolean,
) => {
  const isMatchingName = (
    watchSet: Set<string>,
    watchName: string,
  ): boolean => {
    if (watchSet.has(name)) {
      return true;
    }
    for (const setValue of watchSet.values()) {
      if (
        watchName.startsWith(setValue) &&
        /^\.\w+/.test(watchName.slice(setValue.length))
      ) {
        return true;
      }
    }
    return false;
  };
  return (
    !isBlurEvent && (_names.watchAll || isMatchingName(_names.watch, name))
  );
};
