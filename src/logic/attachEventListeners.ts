import isRadioInput from '../utils/isRadioInput';
import removeAllEventListeners from './removeAllEventListeners';

export default function attachEventListeners({
  mode,
  allFields,
  watchFields,
  radioOptionIndex,
  ref,
  type,
  name,
  validateWithStateUpdate,
}) {
  const field = allFields[name];
  const isOnChange = mode === 'onChange' || watchFields.current[ref.name];
  const isOnBlur = mode === 'onBlur';
  if (!field || (!isOnChange && !isOnBlur)) return;

  const isRadio = isRadioInput(type);

  if (isRadio) {
    const options = field.options;
    const eventAttached = options[radioOptionIndex].eventAttached;

    if (eventAttached) {
      removeAllEventListeners(ref, validateWithStateUpdate);
    } else {
      options[radioOptionIndex].ref.addEventListener(isOnChange ? 'change' : 'blur', validateWithStateUpdate);
    }

    options[radioOptionIndex].eventAttached = !eventAttached;
  } else {
    const eventAttached = field.eventAttached;
    if (eventAttached) {
      removeAllEventListeners(ref, validateWithStateUpdate);
    } else {
      ref.addEventListener(isOnChange ? 'input' : 'blur', validateWithStateUpdate);
    }
    field.eventAttached = !eventAttached;
  }
}
