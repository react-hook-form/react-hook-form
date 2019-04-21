export default function findExistError(errorMessages, name, error) {
  return errorMessages[name].type === error.type;
}
