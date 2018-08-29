import { helper } from '@ember/component/helper';
import moment from 'moment';

export function dateCalendar(params) {
  let date = moment(params[0]);
  let now = moment();
  let diff = now.diff(date);

  if ( Math.abs(diff) > 44 * 60 * 1000 ) {
    return date.calendar();
  } else if ( diff > 0 ) {
    return date.fromNow();
  } else {
    return date.toNow();
  }
}

export default helper(dateCalendar);
