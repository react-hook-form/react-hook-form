import { FormStateSubscription } from '../types';

export default (subscription?: FormStateSubscription) => ({
  isDirty: !!(subscription && subscription.isDirty),
  dirtyFields: !!(subscription && subscription.dirtyFields),
  touchedFields: !!(subscription && subscription.touchedFields),
  isValidating: !!(subscription && subscription.isValidating),
  isValid: !!(subscription && subscription.isValidating),
  errors: !!(subscription && subscription.errors),
});
