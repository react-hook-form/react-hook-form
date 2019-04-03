import isRadioInput from '../utils/isRadioInput';

export default function attachEventListeners({
  mode,
  fields,
  watchFields,
  radioOptionIndex,
  ref,
  type,
  name,
  validateWithStateUpdate,
}) {
  const field = fields[name];
  const isOnChange = mode === 'onChange' || watchFields[ref.name];
  const isOnBlur = mode === 'onBlur';
  if (!field || (!isOnChange && !isOnBlur)) return;

  const isRadio = isRadioInput(type);
  const event = isOnChange ? (isRadio ? 'change' : 'input') : 'blur';

  if (isRadio) {
    const options = field.options;
    const attachedEvents = options[radioOptionIndex].eventAttached;

    if (!options[radioOptionIndex]) return;

    if (!attachedEvents || (attachedEvents && !attachedEvents.includes(event))) {
      options[radioOptionIndex].ref.addEventListener(event, validateWithStateUpdate);
      options[radioOptionIndex].eventAttached = [...attachedEvents || [], event];
    }
  } else {
    if (!field.eventAttached || (field.eventAttached && !field.eventAttached.includes(event))) {
      ref.addEventListener(event, validateWithStateUpdate);
      field.eventAttached = [...field.eventAttached || [], event];
    }
  }
}
