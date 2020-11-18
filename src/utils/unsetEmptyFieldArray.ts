import compact from './compact';
import get from './get';
import unset from './unset';

export default <T>(ref: T, name: string) =>
  !compact(get(ref, name, [])).length && unset(ref, name);
