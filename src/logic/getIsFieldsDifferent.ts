import isUndefined from '../utils/isUndefined';
import isArray from '../utils/isArray';

export default function getIsFieldsDifferent(
  referenceArray: unknown[],
  differenceArray: unknown[],
) {
  let isMatch = false;

  if (
    !isArray<any>(referenceArray) ||
    !isArray<any>(differenceArray) ||
    referenceArray.length !== differenceArray.length
  ) {
    return true;
  }

  for (let i = 0; i < referenceArray.length; i++) {
    if (isMatch) {
      break;
    }
    const dataA = referenceArray[i];
    const dataB = differenceArray[i];

    if (
      isUndefined(dataB) ||
      Object.keys(dataA).length !== Object.keys(dataB).length
    ) {
      isMatch = true;
      break;
    }

    for (const key in dataA) {
      if (dataA[key] !== dataB[key]) {
        isMatch = true;
        break;
      }
    }
  }

  return isMatch;
}
