import { IField } from '../type';
import isCheckbox from '../utils/isCheckBox';

export default function attachEventListeners({
  field,
  radioOptionIndex,
  validateAndStateUpdate,
  isRadio,
}: {
  field: IField;
  radioOptionIndex: number;
  isRadio: boolean;
  validateAndStateUpdate: (
    {
      target: { name },
      type,
    }: any,
  ) => void;
}) {
  const { ref } = field;

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
