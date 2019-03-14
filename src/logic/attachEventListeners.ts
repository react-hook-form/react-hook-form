import isRadioInput from '../utils/isRadioInput';

export default function attachEventListeners({
  mode,
  radioOptionIndexes,
  allFields,
  ref,
  type,
  name,
  validateWithStateUpdate,
}) {
  const field = allFields[name];
  if (!field) return;
  const isOnChange = mode === 'onChange' || allFields[ref.name].watch;
  const isOnBlur = mode === 'onBlur';

  if (isOnChange || isOnBlur) {
    if (isRadioInput(type)) {
      radioOptionIndexes.forEach(index => {
        if (field.options[index]) {
          field.options[index].ref.addEventListener(isOnChange ? 'change' : 'blur', validateWithStateUpdate);
          field.options[index].eventAttached = true;
        }
      });
    } else {
      ref.addEventListener(isOnChange ? 'input' : 'blur', validateWithStateUpdate);
      field.eventAttached = true;
    }
  }
}
