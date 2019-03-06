export default function findMissDomAndCLean(data, fields, validateWithStateUpdate) {
  if (data.ref.type === 'radio') {
    if (!data.options.length) {
      delete fields[data.ref.name];
      return true;
    }
    return data.options.reduce((previous, { ref }) => {
      if (!document.body.contains(ref)) {
        ref.removeEventListener('input', validateWithStateUpdate);
        ref.removeEventListener('change', validateWithStateUpdate);
        delete fields[ref.name];
        return true;
      }
      return previous;
    }, false);
  } else if (data.ref && !document.body.contains(data.ref)) {
    data.ref.removeEventListener('input', validateWithStateUpdate);
    data.ref.removeEventListener('change', validateWithStateUpdate);
    delete fields[data.ref.name];
    return true;
  }
}
