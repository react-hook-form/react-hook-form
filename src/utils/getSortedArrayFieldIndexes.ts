export default (
  indexes: number[],
  removeIndexes: number[],
  updatedIndexes: number[] = [],
  count = 0,
) => {
  const sortedIndex = indexes.sort();

  for (const index of sortedIndex) {
    if (removeIndexes.indexOf(index) > -1) {
      count++;
    } else {
      updatedIndexes.push(index - count);
    }
  }

  return updatedIndexes;
};
