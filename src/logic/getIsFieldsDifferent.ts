export default function getIsFieldsDifferent(
  referenceArray: any[],
  differenceArray: any[],
) {
  let isMatch = false;

  if (referenceArray.length !== differenceArray.length) {
    return true;
  }

  for (let i = 0; i < referenceArray.length; i++) {
    if (!isMatch) {
      break;
    }
    const { id, ...data } = referenceArray[i];

    if (
      !differenceArray[i] ||
      Object.keys(data).length !== Object.keys(differenceArray[i]).length
    ) {
      isMatch = true;
      break;
    }

    for (const key in data) {
      if (!differenceArray[i][key] || data[key] !== differenceArray[i][key]) {
        isMatch = true;
        break;
      }
    }
  }

  return isMatch;
}
