import removeAllEventListeners from './removeAllEventListeners';

export default function findMissDomAndCLean(
  data,
  fields,
  validateWithStateUpdate,
  forceDelete = false,
) {
  if (data.ref.type === 'radio' && data.options) {
    if (!data.options.length) {
      delete fields[data.ref.name];
      return fields;
    }

    return data.options.reduce((previous, { ref }) => {
      if (!document.body.contains(ref)) {
        removeAllEventListeners(ref, validateWithStateUpdate);
        delete fields[ref.name];
        return true;
      }
      return previous;
    }, false);
  } else if (data.ref && (!document.body.contains(data.ref) || forceDelete)) {
    removeAllEventListeners(data.ref, validateWithStateUpdate);
    delete fields[data.ref.name];
    return fields;
  }
}
