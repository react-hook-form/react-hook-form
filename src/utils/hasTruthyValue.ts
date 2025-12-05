export default function hasTruthyValue(obj: any): boolean {
  if (!obj) {
    return false;
  }

  if (obj === true) {
    return true;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (hasTruthyValue(obj[i])) {
        return true;
      }
    }
    return false;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj as Record<string, unknown>);
    for (let i = 0; i < keys.length; i++) {
      const v = (obj as Record<string, unknown>)[keys[i]];
      if (hasTruthyValue(v)) {
        return true;
      }
    }
  }

  return false;
}
