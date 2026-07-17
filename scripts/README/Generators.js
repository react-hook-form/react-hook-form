import Data from 'Data';
import Previews from 'Previews';

function Helpers() {
  return toPreviews('helpers');
}

function Sponsors() {
  return toPreviews('companies') + toPreviews('individuals');
}

function toPreviews(type) {
  return Array.isArray(Data[type])
    ? Data[type].map(Previews[type]).join('\n')
    : '';
}

export default { Sponsors, Helpers };
