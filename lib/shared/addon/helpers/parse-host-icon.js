import { helper } from '@ember/component/helper';
import { BUILT_IN_UI } from 'ui/models/machinedriver';

export function parseHostIcon(params/*, hash*/) {
  let name = params[0] || '';

  if ( BUILT_IN_UI.includes(name) ) {
    return name;
  } else {
    return 'other';
  }
}

export default helper(parseHostIcon);
