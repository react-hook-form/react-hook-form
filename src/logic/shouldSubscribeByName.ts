const isNameMatch = (
  currentName: string,
  signalName: string,
  exact?: boolean,
) =>
  exact
    ? currentName === signalName || currentName.startsWith(signalName + '.')
    : currentName.startsWith(signalName) || signalName.startsWith(currentName);

export default <T extends string | readonly string[] | undefined>(
  name?: T,
  signalName?: string,
  exact?: boolean,
) => {
  if (!name || !signalName || name === signalName) {
    return true;
  }

  if (!Array.isArray(name)) {
    return isNameMatch(name as string, signalName, exact);
  }

  for (const currentName of name) {
    if (currentName && isNameMatch(currentName, signalName, exact)) {
      return true;
    }
  }

  return false;
};
