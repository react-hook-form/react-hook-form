import isWeb from './isWeb';

const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== 'undefined';

export default isProxyEnabled;
