import Helper from '@ember/component/helper';
import moment from 'moment';


export function dateDuration(params) {
  let time = moment.duration(params[0]);

  if ( params.length === 2 ) {
    time = moment.duration(new Date(params[0]) - new Date(params[1]));
  }
  const minutes = time.minutes();
  const seconds = time.seconds();
  let out = '';

  if ( minutes === 1 ) {
    out = '1 minute';
  } else if ( minutes > 1 ) {
    out = `${ minutes } minutes`;
  }

  if ( seconds === 1 ) {
    if ( out ) {
      out += ', 1 second';
    } else {
      out += '1 second';
    }
  } else if ( seconds > 1 ) {
    if ( out ) {
      out += `, ${ seconds } seconds`;
    } else {
      out += `${ seconds } seconds`;
    }
  }

  return out;
}

export default Helper.helper(dateDuration);
