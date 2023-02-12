import { Ref } from '..';

import isHTMLElement from './isHTMLElement';

export default (ref: Ref) => isHTMLElement(ref) && ref.isConnected;
