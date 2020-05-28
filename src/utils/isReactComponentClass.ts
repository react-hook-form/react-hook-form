import React from 'react';

export default (component: any): component is React.ComponentClass<any> =>
  component &&
  component.prototype &&
  (component.prototype.isReactComponent ||
    component.prototype instanceof React.Component);
