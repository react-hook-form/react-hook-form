import { UNDEFINED } from '../constants';

import isWeb from './isWeb';

const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;

export default isProxyEnabled;
