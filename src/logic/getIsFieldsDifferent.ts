import isUndefined from '../utils/isUndefined';
import isArray from '../utils/isArray';

export default function getIsFieldsDifferent(
  referenceArray: unknown[],
  differenceArray: unknown[],
) {
  if (
    !isArray<any>(referenceArray) ||
    !isArray<any>(differenceArray) ||
    referenceArray.length !== differenceArray.length
  ) {
    return true;
  }

  for (let i = 0; i < referenceArray.length; i++) {
    const dataA = referenceArray[i];
    const dataB = differenceArray[i];

    if (
      isUndefined(dataB) ||
      Object.keys(dataA).length !== Object.keys(dataB).length
    ) {
      return true;
    }

    for (const key in dataA) {
      if (dataA[key] !== dataB[key]) {
        return true;
      }
    }
  }

  return false;
}
