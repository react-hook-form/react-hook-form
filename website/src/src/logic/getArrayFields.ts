export default function getArrayFields(name: string, allFields: Object = {}) {
  const arrayIndex = name.match(/\[\d+\]$/gi);
  if (arrayIndex) {
    const index = arrayIndex[0].slice(1, -1);
    const arrayFieldName = name.substr(0, name.indexOf('['));
    if (!allFields[arrayFieldName]) {
      allFields[arrayFieldName] = [];
      allFields[arrayFieldName][index] = {};
    }

    return {
      index: parseInt(index),
      arrayFieldName,
    };
  }

  return {
    index: -1,
    arrayFieldName: '',
  };
}
