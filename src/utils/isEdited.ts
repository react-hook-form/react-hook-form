import type { Ref } from '../types';

import isCheckBoxInput from './isCheckBoxInput';
import isRadioInput from './isRadioInput';

export default (ref: Ref): boolean =>
  isCheckBoxInput(ref)
    ? ref.checked !== ref.defaultChecked
    : !isRadioInput(ref) &&
      'defaultValue' in ref &&
      ref.value !== ref.defaultValue;
