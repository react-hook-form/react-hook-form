export default function appendNativeRule(ref, data) {
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'required') {
      ref[key] = true;
    } else if (key === 'pattern' && value instanceof RegExp) {
      ref[key] = value.source;
    } else {
      ref[key] = value;
    }
  });
}
