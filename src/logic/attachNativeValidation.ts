export default function attachNativeValidation(ref, rules) {
  Object.entries(rules).forEach(([key, value]) => {
    if (key === 'required') {
      ref[key] = true;
    } else if (key === 'pattern' && value instanceof RegExp) {
      ref[key] = value.source;
    } else {
      ref[key] = value;
    }
  });
}
