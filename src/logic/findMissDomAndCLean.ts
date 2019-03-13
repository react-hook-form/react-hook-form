import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from "../utils/isRadioInput";

export default function findMissDomAndCLean({
  target: {
    ref,
    ref: { name, type },
    mutationWatcher,
    options,
  },
  fields,
  validateWithStateUpdate,
  forceDelete = false,
}: {
  target: any;
  fields: { [key: string]: any };
  validateWithStateUpdate: Function;
  forceDelete?: boolean;
}) {
  if (isRadioInput(type) && options) {
    options.forEach(({ ref, mutationWatcher }, index) => {
      if (!document.body.contains(ref)) {
        removeAllEventListeners(ref, validateWithStateUpdate);
        mutationWatcher.options[index].disconnect();
        delete fields[name].option[index];
        delete fields[name].mutationWatcher[index];
      }
    });

    if (!options.length) {
      delete fields[name];
      delete fields[name].mutationWatcher;
      return fields;
    }
  } else if (ref && (!document.body.contains(ref) || forceDelete)) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    mutationWatcher.disconnect();
    delete fields[name];
    return fields;
  }

  return fields;
}
