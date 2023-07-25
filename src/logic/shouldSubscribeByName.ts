import convertToArrayPayload from '../utils/convertToArrayPayload';

export default <T extends string | string[] | undefined>(
  name?: T,
  signalName?: string,
  exact?: boolean,
) =>
  exact && signalName
    ? name === signalName
    : !name ||
      !signalName ||
      name === signalName ||
      convertToArrayPayload(name).some(
        (currentName) =>
          currentName &&
          ((!exact &&
            (currentName.startsWith(signalName) ||
              signalName.startsWith(currentName))) ||
            (exact && currentName === signalName)),
      );
