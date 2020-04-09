import isUndefined from './isUndefined';

export default (
  indexes: number[],
  prependAmount = 0,
  removeIndexes: number[] = [],
) => {
  const fieldArrayIndexes = indexes.sort();
  const sortedIndex = [
    ...(prependAmount ? Array(prependAmount) : []),
    ...fieldArrayIndexes,
  ];
  const updatedIndexes = [];
  let count = 0;

  for (const index of sortedIndex) {
    const indexUndefined = isUndefined(index);
    if (removeIndexes.indexOf(index) > -1 || indexUndefined) {
      if (indexUndefined) {
        updatedIndexes.push(count);
      }
      count++;
    } else {
      updatedIndexes.push(index - (prependAmount ? -count : count));
    }
  }

  return updatedIndexes;
};
