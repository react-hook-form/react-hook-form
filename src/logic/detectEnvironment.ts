import { UNDEFINED } from '../constants';
import isUndefined from '../utils/isUndefined';

export default (): {
  isWeb: boolean;
  isWindowUndefined: boolean;
  isProxyEnabled: boolean;
} => {
  const isWindowUndefined = typeof window === UNDEFINED;
  const isWeb =
    typeof document !== UNDEFINED &&
    !isWindowUndefined &&
    !isUndefined(window.HTMLElement);

  return {
    isWeb,
    isWindowUndefined,
    isProxyEnabled: isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED,
  };
};
