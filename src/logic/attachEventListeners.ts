import isRadioInput from "../utils/isRadioInput";

export default function attachEventListeners({ mode, allFields, radioOptionIndex, ref, type, name, validateWithStateUpdate }) {
  const field = allFields[name];
  if (!field) return;
  const isOnChange = mode === 'onChange' || allFields[ref.name].watch;
  const isOnBlur = mode === 'onBlur';

  if (isOnChange || isOnBlur) {
    if (isRadioInput(type)) {
      const options = field.options;
      options[radioOptionIndex].ref.addEventListener(isOnChange ? 'change' : 'blur', validateWithStateUpdate);
      options[radioOptionIndex].eventAttached = true;
    } else {
      ref.addEventListener(isOnChange ? 'input' : 'blur', validateWithStateUpdate);
      field.eventAttached = true;
    }
  }
}
