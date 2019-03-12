import removeAllEventListeners from './removeAllEventListeners';

export default function findMissDomAndCLean({
  target: {
    ref,
    ref: { name, type },
    options,
  },
  fields,
  validateWithStateUpdate,
  forceDelete = false,
}: {
  target: any;
  fields: { [key: string]: any },
  validateWithStateUpdate: Function;
  forceDelete?: boolean;
}) {
  if (type === 'radio' && options) {
    if (!options.length) {
      delete fields[name];
      return fields;
    }

    return options.reduce((previous, { ref }, index) => {
      if (!document.body.contains(ref)) {
        removeAllEventListeners(ref, validateWithStateUpdate);
        delete fields[name].option[index];
        return fields;
      }
      return previous;
    }, {});
  } else if (ref && (!document.body.contains(ref) || forceDelete)) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    delete fields[name];
    return fields;
  }
}
