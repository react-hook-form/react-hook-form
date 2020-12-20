import isWeb from './isWeb';
import { UNDEFINED } from '../constants';

const isProxyEnabled = isWeb ? 'Proxy' in window : typeof Proxy !== UNDEFINED;

export default isProxyEnabled;
