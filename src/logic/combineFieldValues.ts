export default function combineFieldValues(data) {
  const output = Object.entries(data).reduce((previous, [key, value]) => {
    const arrayIndex = key.match(/\[\d+\]$/gi);

    if (arrayIndex) {
      const index = arrayIndex[0].slice(1, -1);
      const filedName = key.substr(0, key.indexOf('['));
      if (!previous[filedName]) previous[filedName] = [];
      previous[filedName][index] = value;
    } else {
      previous[key] = value;
    }
    return previous;
  }, {});

  return Object.entries(output).reduce((previous, [key, value]) => {
    if (Array.isArray(value)) {
      previous[key] = value.filter(Boolean);
      return previous;
    }

    previous[key] = value;
    return previous;
  }, {});
}
