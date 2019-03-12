export default (ref, validateWithStateUpdate, removeReference) => {
  ref.removeEventListener('input', validateWithStateUpdate);
  ref.removeEventListener('change', validateWithStateUpdate);
  ref.removeEventListener('blur', validateWithStateUpdate);
  ref.removeEventListener('DOMNodeRemovedFromDocument', removeReference);
};
