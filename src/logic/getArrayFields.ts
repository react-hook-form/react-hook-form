export default function getArrayFields(name: string, allFields: Object = {}): number {
  const arrayIndex = name.match(/\[\d+\]$/gi);
  if (arrayIndex) {
    const index = arrayIndex[0].slice(1, -1);
    const filedName = name.substr(0, name.indexOf('['));
    if (!allFields[filedName]) {
      allFields[filedName] = [];
      allFields[filedName][index] = {};
    }

    return parseInt(index);
  }

  return -1;
}
