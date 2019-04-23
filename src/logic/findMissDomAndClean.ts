import removeAllEventListeners from './removeAllEventListeners';
import isRadioInput from '../utils/isRadioInput';
import { IField } from '../type';

export default function findMissDomAndClean(
  fields: { [key: string]: IField },
  validateWithStateUpdate: Function,
  { ref, mutationWatcher, options }: IField,
  forceDelete = false,
) {
  if (!ref) return;

  const { name, type } = ref;
  if (isRadioInput(type) && options) {
    const optionsCopy = fields[name].options;
    options.forEach(({ ref }, index) => {
      if (!document.body.contains(ref) && fields[name] && optionsCopy && optionsCopy[index]) {
        removeAllEventListeners(optionsCopy[index], validateWithStateUpdate);
        if (optionsCopy[index].mutationWatcher) {
          // @ts-ignore
          optionsCopy[index].mutationWatcher.disconnect();
        }
        optionsCopy.splice(index, 1);
      }
    });

    if (Array.isArray(optionsCopy) && !optionsCopy.length) {
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
