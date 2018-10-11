import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';
import moment from 'moment';

export function dateFromNow(params) {
  let d = moment(params[0]);
  let str = `<span title="${  d.format('llll')  }">${  d.fromNow()  }</span>`;

  return htmlSafe(str);
}

export default helper(dateFromNow);
