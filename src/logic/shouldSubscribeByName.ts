import convertToArrayPayload from '../utils/convertToArrayPayload';

export default <T extends string | string[] | undefined>(
  name?: T,
  signalName?: string,
) =>
  !name ||
  !signalName ||
  name === signalName ||
  convertToArrayPayload(name).some(
    (currentName) =>
      currentName &&
      (currentName.startsWith(signalName) ||
        signalName.startsWith(currentName)),
  );
