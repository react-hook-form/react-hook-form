export default (
  indexes: number[],
  removeIndexes: number[],
  updatedIndexes: number[] = [],
  count = 0,
  notFoundIndexes: number[] = [],
): number[] => {
  for (const removeIndex of removeIndexes) {
    if (indexes.indexOf(removeIndex) < 0) {
      notFoundIndexes.push(removeIndex);
    }
  }

  for (const index of indexes.sort()) {
    if (removeIndexes.indexOf(index) > -1) {
      updatedIndexes.push(-1);
      count++;
    } else {
      updatedIndexes.push(
        index -
          count -
          (notFoundIndexes.length
            ? notFoundIndexes
                .map((notFoundIndex) => notFoundIndex < index)
                .filter(Boolean).length
            : 0),
      );
    }
  }

  return updatedIndexes;
};
