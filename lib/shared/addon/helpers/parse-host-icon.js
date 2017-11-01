import Ember from 'ember';
import { builtInUi } from 'ui/models/machinedriver';

export function parseHostIcon(params/*, hash*/) {
  let name = params[0] || '';

  if ( builtInUi.includes(name) ) {
    return name;
  } else {
    return 'other';
  }
}

export default Ember.Helper.helper(parseHostIcon);
