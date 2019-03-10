import removeAllEventListeners from './removeAllEventListeners';

export default function findMissDomAndCLean(
  data,
  fields,
  validateWithStateUpdate,
  removeReference,
  forceDelete = false,
) {
  if (data.ref.type === 'radio' && data.options) {
    if (!data.options.length) {
      delete fields[data.ref.name];
      return fields;
    }
    data.options.reduce((previous, { ref }) => {
      if (!document.body.contains(ref)) {
        removeAllEventListeners(ref, validateWithStateUpdate, removeReference);
        delete fields[ref.name];
        return true;
      }
      return previous;
    }, false);
    return fields;
  } else if (data.ref && (!document.body.contains(data.ref) || forceDelete)) {
    removeAllEventListeners(data.ref, validateWithStateUpdate, removeReference);
    delete fields[data.ref.name];
    return fields;
  }
}
