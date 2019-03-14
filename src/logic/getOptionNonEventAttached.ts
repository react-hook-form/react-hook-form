import isRadioInput from '../utils/isRadioInput';

export default function getOptionNonEventAttached(field, type, value) {
  return isRadioInput(type)
    ? field.options.findIndex(({ ref, eventAttached }) => value === ref.value && !eventAttached)
    : -1;
}
