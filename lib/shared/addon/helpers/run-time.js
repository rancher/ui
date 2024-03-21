import { helper } from '@ember/component/helper';
import moment from 'moment';
import { htmlSafe } from '@ember/string';

export function runTime(params) {
  var s = moment(params[0]);
  var e = moment(params[1]);
  var time =  Math.round(e.diff(s) / 100) / 10;

  if ( time ) {
    if ( time > 60 ) {
      time = Math.round(time);
    }

    return `${ time } sec`;
  } else {
    return htmlSafe('<span class="text-muted">-</span>');
  }
}

export default helper(runTime);
