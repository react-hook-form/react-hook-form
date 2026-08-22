function safeJSONStringify(value?: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function safeJSONParse(value?: string) {
  try {
    return JSON.parse(value as string);
  } catch {
    return;
  }
}

const safeJSON = {
  stringify: safeJSONStringify,
  parse: safeJSONParse,
};

export { safeJSON, safeJSONParse, safeJSONStringify };

export default safeJSON;
