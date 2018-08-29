import { helper } from '@ember/component/helper';
import moment from 'moment';

export function dateStr(params, options) {
  var format = 'MMM DD, YYYY hh:mm:ss A';

  if ( options && options.format ) {
    format = options.format;
  }

  return moment(params[0]).format(format);
}

export default helper(dateStr);
