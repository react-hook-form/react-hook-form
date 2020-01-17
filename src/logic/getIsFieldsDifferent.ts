export default function getIsFieldsDifferent(
  referenceArray: any[],
  differenceArray: any[],
) {
  let isMatch = false;

  if (referenceArray.length !== differenceArray.length) {
    return true;
  }

  for (let i = 0; i < referenceArray.length; i++) {
    if (isMatch) {
      break;
    }
    const dataA = referenceArray[i];
    const dataB = differenceArray[i];

    if (!dataB || Object.keys(dataA).length !== Object.keys(dataB).length) {
      isMatch = true;
      break;
    }

    for (const key in dataA) {
      if (!dataB[key] || dataA[key] !== dataB[key]) {
        isMatch = true;
        break;
      }
    }
  }

  return isMatch;
}
