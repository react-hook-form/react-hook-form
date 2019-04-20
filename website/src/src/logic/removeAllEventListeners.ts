export default (ref, validateWithStateUpdate): void => {
  console.log(ref);
  ref.removeEventListener('input', validateWithStateUpdate);
  ref.removeEventListener('change', validateWithStateUpdate);
  ref.removeEventListener('blur', validateWithStateUpdate);
};
