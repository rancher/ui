import { helper } from '@ember/component/helper';
import { builtInUi } from 'ui/models/machinedriver';

export function parseHostIcon(params/*, hash*/) {
  let name = params[0] || '';

  if ( builtInUi.includes(name) ) {
    return name;
  } else {
    return 'other';
  }
}

export default helper(parseHostIcon);
