import convertToArrayPayload from '../utils/convertToArrayPayload';

export default <T>(name?: T, signalName?: string) =>
  !name ||
  !signalName ||
  convertToArrayPayload(name).some(
    (currentName) =>
      currentName &&
      (currentName.startsWith(signalName) ||
        signalName.startsWith(currentName)),
  );
