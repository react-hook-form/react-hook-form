import { IField } from '../index';
import isCheckbox from '../utils/isCheckBox';

export default function attachEventListeners({
  mode,
  field,
  watchFields,
  radioOptionIndex,
  validateAndStateUpdate,
  isWatchAll = false,
  isRadio,
}: {
  mode: string;
  field: IField;
  watchFields: { [key: string]: boolean };
  radioOptionIndex: number;
  isRadio: boolean;
  validateAndStateUpdate: (
    {
      target: { name },
      type,
    }: any,
  ) => void;
  isWatchAll?: boolean;
}) {
  const { ref } = field;
  const isOnChange = mode === 'onChange' || watchFields[ref.name] || isWatchAll;
  const isOnBlur = mode === 'onBlur';
  if (!isOnChange && !isOnBlur) return;

  if (isRadio && field.options) {
    const options = field.options;

    if (!options[radioOptionIndex]) return;

    options[radioOptionIndex].ref.addEventListener('change', validateAndStateUpdate);
    options[radioOptionIndex].ref.addEventListener('blur', validateAndStateUpdate);
  } else {
    ref.addEventListener(isCheckbox(ref.type) ? 'change' : 'input', validateAndStateUpdate);
    ref.addEventListener('blur', validateAndStateUpdate);
  }
}
