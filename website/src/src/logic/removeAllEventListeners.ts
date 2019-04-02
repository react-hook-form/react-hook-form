export default (ref, validateWithStateUpdate): void => {
  ref.removeEventListener('input', validateWithStateUpdate);
  ref.removeEventListener('change', validateWithStateUpdate);
  ref.removeEventListener('blur', validateWithStateUpdate);
};
