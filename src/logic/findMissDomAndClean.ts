import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';

export default function findMissDomAndClean({
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
    options.forEach(({ ref }, index) => {
      if (!document.body.contains(ref) && fields[name] && fields[name].options && fields[name].options[index]) {
        removeAllEventListeners(fields[name].options[index], validateWithStateUpdate);
        fields[name].options[index].mutationWatcher.disconnect();
        fields[name].options.splice(index, 1);
      }
    });

    if (!fields[name].options.length) {
      delete fields[name];
      return fields;
    }
  } else if (ref && (!document.body.contains(ref) || forceDelete)) {
    removeAllEventListeners(ref, validateWithStateUpdate);
    if (mutationWatcher) mutationWatcher.disconnect();
    delete fields[name];
    return fields;
  }

  return fields;
}
