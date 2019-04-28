import { IField } from '../type';
import isCheckbox from '../utils/isCheckBox';

export default function attachEventListeners({
  field,
  validateAndStateUpdate,
  isRadio,
}: {
  field: IField;
  isRadio: boolean;
  validateAndStateUpdate: (any) => void;
}) {
  const { ref } = field;
  ref.addEventListener(isCheckbox(ref.type) || isRadio ? 'change' : 'input', validateAndStateUpdate);
  ref.addEventListener('blur', validateAndStateUpdate);
}
