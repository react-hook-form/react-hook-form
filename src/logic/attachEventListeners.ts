import isRadioInput from "../utils/isRadioInput";

export default function attachEventListeners({ mode, allFields, optionIndex, ref, type, name, validateWithStateUpdate }) {
  const field = allFields[name];
  if (!field) return;

  if (mode === 'onChange' || allFields[ref.name].watch) {
    if (isRadioInput(type)) {
      const options = field.options;

      options[optionIndex].ref.addEventListener('change', validateWithStateUpdate);
      options[optionIndex].eventAttached = true;
    } else {
      ref.addEventListener('input', validateWithStateUpdate);
      field.eventAttached = true;
    }
  } else if (mode === 'onBlur') {
    if (isRadioInput(type)) {
      const options = field.options;

      options[optionIndex].ref.addEventListener('blur', validateWithStateUpdate);
      options[optionIndex].eventAttached = true;
    } else {
      ref.addEventListener('blur', validateWithStateUpdate);
      field.eventAttached = true;
    }
  }
}
