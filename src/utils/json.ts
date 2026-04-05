function safeJSONStringify(value?: any) {
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return '';
  }
}

function safeJSONParse(value?: any) {
  try {
    return JSON.parse(value);
  } catch (_err) {
    return;
  }
}

const safeJSON = {
  stringify: safeJSONStringify,
  parse: safeJSONParse,
};

export { safeJSON, safeJSONParse, safeJSONStringify };

export default safeJSON;
