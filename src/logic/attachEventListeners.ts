import isRadioInput from '../utils/isRadioInput';

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

    if (!options[radioOptionIndex]) return;

    if (!options[radioOptionIndex].eventAttached) {
      options[radioOptionIndex].ref.addEventListener(isOnChange ? 'change' : 'blur', validateWithStateUpdate);
      options[radioOptionIndex].eventAttached = true;
    }
  } else {
    if (!field.eventAttached) {
      ref.addEventListener(isOnChange ? 'input' : 'blur', validateWithStateUpdate);
      field.eventAttached = true;
    }
  }
}
