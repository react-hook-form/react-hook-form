import { IField } from '../index';
import isCheckbox from '../utils/isCheckBox';

export default function attachEventListeners({
  mode,
  field,
  watchFields,
  radioOptionIndex,
  ref,
  validateAndStateUpdate,
  isWatchAll = false,
  isRadio,
}: {
  mode: string;
  field: IField;
  watchFields: { [key: string]: boolean };
  radioOptionIndex: number;
  ref: any;
  isRadio: boolean;
  validateAndStateUpdate: (
    {
      target: { name },
      type,
    }: any,
  ) => void;
  isWatchAll?: boolean;
}) {
  const isOnChange = mode === 'onChange' || watchFields[ref.name] || isWatchAll;
  const isOnBlur = mode === 'onBlur';
  if (!isOnChange && !isOnBlur) return;

  if (isRadio && field.options) {
    const options = field.options;
    const attachedEvents = options[radioOptionIndex].eventAttached || '';

    if (!options[radioOptionIndex] || attachedEvents) return;

    options[radioOptionIndex].ref.addEventListener('change', validateAndStateUpdate);
    options[radioOptionIndex].ref.addEventListener('blur', validateAndStateUpdate);
    options[radioOptionIndex].eventAttached = [...(attachedEvents || []), 'change', 'blur'];
  } else {
    if (field && field.eventAttached) return;

    ref.addEventListener(isCheckbox(ref.type) ? 'change' : 'input', validateAndStateUpdate);
    ref.addEventListener('blur', validateAndStateUpdate);
    field.eventAttached = [...(field.eventAttached || []), isCheckbox(ref.type) ? 'change' : 'input', 'blur'];
  }
}
