import isRadioInput from '../utils/isRadioInput';
import { Field } from '../index';

export default function attachEventListeners({
  mode,
  fields,
  watchFields,
  radioOptionIndex,
  ref,
  type,
  name,
  validateWithStateUpdate,
  isWatchAll = false,
}: {
  mode: string;
  fields: any;
  watchFields: { [key: string]: boolean };
  radioOptionIndex: number;
  ref: any;
  type: string;
  name: string;
  validateWithStateUpdate: any;
  isWatchAll?: boolean;
}) {
  const field = fields[name];
  const isOnChange = mode === 'onChange' || watchFields[ref.name] || isWatchAll;
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
      options[radioOptionIndex].eventAttached = [...(attachedEvents || []), event];
    }
  } else {
    if (!field.eventAttached || (field.eventAttached && !field.eventAttached.includes(event))) {
      ref.addEventListener(event, validateWithStateUpdate);
      field.eventAttached = [...(field.eventAttached || []), event];
    }
  }
}
